package expo.modules.truecaller

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoTruecallerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoTruecaller")

    Events("onVerificationResult")

    AsyncFunction("initialize") { _: Map<String, Any?>? ->
      // No-op - there's no SDK to initialize.
    }

    AsyncFunction("isTruecallerUsable") {
      false
    }

    AsyncFunction("requestVerification") {
      sendEvent(
        "onVerificationResult",
        mapOf(
          "status" to "failure",
          "error" to "INTERNAL_ERROR",
          "errorMessage" to "Truecaller isn't configured for Android on this app (no " +
            "androidClientId in the expo-truecaller config plugin) - the Truecaller Android " +
            "SDK wasn't bundled into this build."
        )
      )
    }

    AsyncFunction("clearCredentials") {
      // No-op - there's no native session state to clear.
    }
  }
}
