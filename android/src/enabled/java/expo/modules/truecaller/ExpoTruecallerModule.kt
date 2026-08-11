package expo.modules.truecaller

import android.content.Context
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import com.truecaller.android.sdk.oAuth.CodeVerifierUtil
import com.truecaller.android.sdk.oAuth.OAuthThemeOptions
import com.truecaller.android.sdk.oAuth.TcOAuthCallback
import com.truecaller.android.sdk.oAuth.TcOAuthData
import com.truecaller.android.sdk.oAuth.TcOAuthError
import com.truecaller.android.sdk.oAuth.TcSdk
import com.truecaller.android.sdk.oAuth.TcSdkOptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CompletableDeferred
import java.math.BigInteger
import java.security.SecureRandom
import java.util.Locale

class ExpoTruecallerModule : Module() {
  @Volatile private var isSdkReady = false
  private var sdkInitResult: CompletableDeferred<Unit>? = null
  private var stateRequested: String? = null
  private var codeVerifier: String? = null

  private val tcOAuthCallback = object : TcOAuthCallback {
    override fun onSuccess(tcOAuthData: TcOAuthData) {
      if (tcOAuthData.state != stateRequested) {
        sendEvent(
          "onVerificationResult",
          mapOf(
            "status" to "failure",
            "error" to "UNKNOWN",
            "errorMessage" to "OAuth state mismatch - the response didn't match the request " +
              "this module made, so it was rejected as a possible forged/replayed response."
          )
        )
        return
      }

      sendEvent(
        "onVerificationResult",
        mapOf(
          "status" to "success",
          "platform" to "android",
          "authorizationCode" to tcOAuthData.authorizationCode,
          "codeVerifier" to codeVerifier,
          "scopesGranted" to tcOAuthData.scopesGranted,
          "simState" to tcOAuthData.simState,
          "deviceCode" to tcOAuthData.deviceCode
        )
      )
    }

    override fun onFailure(tcOAuthError: TcOAuthError) {
      if (!isSdkReady) {
        TcSdk.clear()
        sdkInitResult?.complete(Unit)
        sdkInitResult = null
      }

      sendEvent(
        "onVerificationResult",
        mapOf(
          "status" to "failure",
          "error" to mapTcErrorCode(tcOAuthError.errorCode),
          "errorMessage" to tcOAuthError.errorMessage
        )
      )
    }

    override fun onVerificationRequired(tcOAuthError: TcOAuthError?) {
      sendEvent(
        "onVerificationResult",
        mapOf(
          "status" to "dismissed",
          "errorMessage" to "Truecaller can't verify this user via the one-tap flow (e.g. " +
            "they're not a Truecaller user, or their SIM can't be verified this way) - fall " +
            "back to your app's other verification method."
        )
      )
    }

    override fun onSdkReady() {
      isSdkReady = true
      sdkInitResult?.complete(Unit)
    }
  }

  private suspend fun ensureSdkInitialized(context: Context, options: Map<String, Any?>? = null): Boolean {
    if (isSdkReady) return true

    val deferred = sdkInitResult ?: CompletableDeferred<Unit>().also { newDeferred ->
      sdkInitResult = newDeferred
      try {
        val builder = TcSdkOptions.Builder(context, tcOAuthCallback)
        applyCustomization(builder, options)
        TcSdk.initAsync(builder.build())
      } catch (e: Exception) {
        sdkInitResult = null
        sendEvent(
          "onVerificationResult",
          mapOf(
            "status" to "failure",
            "error" to "INTERNAL_ERROR",
            "errorMessage" to (e.message ?: "Truecaller SDK failed to initialize.")
          )
        )
        newDeferred.completeExceptionally(e)
      }
    }

    return try {
      deferred.await()
      isSdkReady
    } catch (e: Exception) {
      false
    }
  }

  override fun definition() = ModuleDefinition {
    Name("ExpoTruecaller")

    Events("onVerificationResult")

    AsyncFunction("initialize") Coroutine { options: Map<String, Any?>? ->
      val context = appContext.reactContext
        ?: throw IllegalStateException("No context available to initialize Truecaller SDK")
      ensureSdkInitialized(context, options)
      Unit
    }

    AsyncFunction("isTruecallerUsable").Coroutine<Boolean> {
      val activity = appContext.currentActivity ?: return@Coroutine false
      if (!ensureSdkInitialized(activity)) return@Coroutine false
      TcSdk.getInstance().isOAuthFlowUsable
    }

    AsyncFunction("requestVerification") Coroutine { options: Map<String, Any?>? ->
      val activity = appContext.currentActivity
        ?: throw IllegalStateException("No activity available to launch Truecaller verification")

      if (!ensureSdkInitialized(activity)) return@Coroutine

      if (!TcSdk.getInstance().isOAuthFlowUsable) {
        sendEvent(
          "onVerificationResult",
          mapOf(
            "status" to "failure",
            "error" to "NOT_INSTALLED",
            "errorMessage" to "Truecaller app is not installed, not signed in, or otherwise unusable on this device."
          )
        )
        return@Coroutine
      }

      val newState = BigInteger(130, SecureRandom()).toString(32)
      stateRequested = newState
      TcSdk.getInstance().setOAuthState(newState)

      @Suppress("UNCHECKED_CAST")
      val requestedScopes = (options?.get("scopes") as? List<String>)
        ?.takeIf { it.isNotEmpty() }
        ?.toTypedArray()
        ?: arrayOf("profile", "phone")
      TcSdk.getInstance().setOAuthScopes(requestedScopes)

      val newCodeVerifier = CodeVerifierUtil.generateRandomCodeVerifier()
      codeVerifier = newCodeVerifier
      val codeChallenge = CodeVerifierUtil.getCodeChallenge(newCodeVerifier)

      if (codeChallenge == null) {
        sendEvent(
          "onVerificationResult",
          mapOf(
            "status" to "failure",
            "error" to "UNSUPPORTED_OS_VERSION",
            "errorMessage" to "This device doesn't support the SHA-256/Base64 operations PKCE requires."
          )
        )
        return@Coroutine
      }

      TcSdk.getInstance().setCodeChallenge(codeChallenge)

      (options?.get("theme") as? String)?.let {
        val theme = if (it == "dark") OAuthThemeOptions.DARK else OAuthThemeOptions.LIGHT
        TcSdk.getInstance().setTheme(theme)
      }
      (options?.get("language") as? String)?.let {
        TcSdk.getInstance().setLocale(Locale.forLanguageTag(it))
      }

      val launcher = (activity as ComponentActivity).activityResultRegistry.register(
        "TruecallerOAuth-${System.currentTimeMillis()}",
        ActivityResultContracts.StartActivityForResult()
      ) { /* no-op - see OnActivityResult below */ }

      TcSdk.getInstance().getAuthorizationCode(activity, launcher)
    }

    AsyncFunction("clearCredentials") {
      TcSdk.clear()
      isSdkReady = false
      sdkInitResult = null
    }

    OnActivityResult { activity, payload ->
      TcSdk.getInstance().onActivityResultObtained(activity, payload.resultCode, payload.data)
    }
  }
}
