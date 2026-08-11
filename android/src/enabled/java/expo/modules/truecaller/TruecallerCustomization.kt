package expo.modules.truecaller

import com.truecaller.android.sdk.oAuth.TcSdkOptions
import androidx.core.graphics.toColorInt

fun applyCustomization(builder: TcSdkOptions.Builder, options: Map<String, Any?>?) {
  options ?: return

  (options["buttonColor"] as? String)?.let { builder.buttonColor(it.toColorInt()) }
  (options["buttonTextColor"] as? String)?.let { builder.buttonTextColor(it.toColorInt()) }
  (options["loginTextPrefix"] as? String)?.let { mapLoginTextPrefix(it)?.let(builder::loginTextPrefix) }
  (options["ctaText"] as? String)?.let { mapCtaText(it)?.let(builder::ctaText) }
  (options["buttonShape"] as? String)?.let { mapButtonShape(it)?.let(builder::buttonShapeOptions) }
  (options["footerType"] as? String)?.let { mapFooterType(it)?.let(builder::footerType) }
  (options["consentHeading"] as? String)?.let { mapConsentHeading(it)?.let(builder::consentHeadingOption) }
  (options["verifyMode"] as? String)?.let { mapVerifyMode(it)?.let(builder::sdkOptions) }
  (options["dismissOption"] as? String)?.let { mapDismissOption(it)?.let(builder::dismissOptions) }
  (options["consentMode"] as? String)?.let { mapConsentMode(it)?.let(builder::consentMode) }
  (options["enhancedBottomSheet"] as? Boolean)?.let { builder.setEnhancedBottomSheet(it) }
}
