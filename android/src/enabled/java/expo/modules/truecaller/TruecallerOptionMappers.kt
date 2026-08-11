package expo.modules.truecaller

import com.truecaller.android.sdk.oAuth.TcSdkOptions

fun mapLoginTextPrefix(key: String): Int? = when (key) {
  "toGetStarted" -> TcSdkOptions.LOGIN_TEXT_PREFIX_TO_GET_STARTED
  "toContinue" -> TcSdkOptions.LOGIN_TEXT_PREFIX_TO_CONTINUE
  "toPlaceOrder" -> TcSdkOptions.LOGIN_TEXT_PREFIX_TO_PLACE_ORDER
  "toCompleteYourPurchase" -> TcSdkOptions.LOGIN_TEXT_PREFIX_TO_COMPLETE_YOUR_PURCHASE
  "toCheckout" -> TcSdkOptions.LOGIN_TEXT_PREFIX_TO_CHECKOUT
  "toCompleteYourBooking" -> TcSdkOptions.LOGIN_TEXT_PREFIX_TO_COMPLETE_YOUR_BOOKING
  "toProceedWithYourBooking" -> TcSdkOptions.LOGIN_TEXT_PREFIX_TO_PROCEED_WITH_YOUR_BOOKING
  "toContinueWithYourBooking" -> TcSdkOptions.LOGIN_TEXT_PREFIX_TO_CONTINUE_WITH_YOUR_BOOKING
  "toGetDetails" -> TcSdkOptions.LOGIN_TEXT_PREFIX_TO_GET_DETAILS
  "toViewMore" -> TcSdkOptions.LOGIN_TEXT_PREFIX_TO_VIEW_MORE
  "toContinueReading" -> TcSdkOptions.LOGIN_TEXT_PREFIX_TO_CONTINUE_READING
  "toProceed" -> TcSdkOptions.LOGIN_TEXT_PREFIX_TO_PROCEED
  "forNewUpdates" -> TcSdkOptions.LOGIN_TEXT_PREFIX_FOR_NEW_UPDATES
  "toGetUpdates" -> TcSdkOptions.LOGIN_TEXT_PREFIX_TO_GET_UPDATES
  "toSubscribe" -> TcSdkOptions.LOGIN_TEXT_PREFIX_TO_SUBSCRIBE
  "toSubscribeAndGetUpdates" -> TcSdkOptions.LOGIN_TEXT_PREFIX_TO_SUBSCRIBE_AND_GET_UPDATES
  else -> null
}

fun mapCtaText(key: String): Int? = when (key) {
  "proceed" -> TcSdkOptions.CTA_TEXT_PROCEED
  "continue" -> TcSdkOptions.CTA_TEXT_CONTINUE
  "accept" -> TcSdkOptions.CTA_TEXT_ACCEPT
  "confirm" -> TcSdkOptions.CTA_TEXT_CONFIRM
  "use" -> TcSdkOptions.CTA_TEXT_USE
  "continueWith" -> TcSdkOptions.CTA_TEXT_CONTINUE_WITH
  "proceedWith" -> TcSdkOptions.CTA_TEXT_PROCEED_WITH
  else -> null
}

fun mapButtonShape(key: String): Int? = when (key) {
  "rounded" -> TcSdkOptions.BUTTON_SHAPE_ROUNDED
  "rectangle" -> TcSdkOptions.BUTTON_SHAPE_RECTANGLE
  else -> null
}

fun mapFooterType(key: String): Int? = when (key) {
  "skip" -> TcSdkOptions.FOOTER_TYPE_SKIP
  "anotherMobileNumber" -> TcSdkOptions.FOOTER_TYPE_ANOTHER_MOBILE_NO
  "anotherMethod" -> TcSdkOptions.FOOTER_TYPE_ANOTHER_METHOD
  "manually" -> TcSdkOptions.FOOTER_TYPE_MANUALLY
  "later" -> TcSdkOptions.FOOTER_TYPE_LATER
  else -> null
}

fun mapConsentHeading(key: String): Int? = when (key) {
  "logInTo" -> TcSdkOptions.SDK_CONSENT_HEADING_LOG_IN_TO
  "signUpWith" -> TcSdkOptions.SDK_CONSENT_HEADING_SIGN_UP_WITH
  "signInTo" -> TcSdkOptions.SDK_CONSENT_HEADING_SIGN_IN_TO
  "verifyNumberWith" -> TcSdkOptions.SDK_CONSENT_HEADING_VERIFY_NUMBER_WITH
  "registerWith" -> TcSdkOptions.SDK_CONSENT_HEADING_REGISTER_WITH
  "getStartedWith" -> TcSdkOptions.SDK_CONSENT_HEADING_GET_STARTED_WITH
  "proceedWith" -> TcSdkOptions.SDK_CONSENT_HEADING_PROCEED_WITH
  "verifyWith" -> TcSdkOptions.SDK_CONSENT_HEADING_VERIFY_WITH
  "verifyProfileWith" -> TcSdkOptions.SDK_CONSENT_HEADING_VERIFY_PROFILE_WITH
  "verifyYourProfileWith" -> TcSdkOptions.SDK_CONSENT_HEADING_VERIFY_YOUR_PROFILE_WITH
  "verifyPhoneNoWith" -> TcSdkOptions.SDK_CONSENT_HEADING_VERIFY_PHONE_NO_WITH
  "verifyYourNoWith" -> TcSdkOptions.SDK_CONSENT_HEADING_VERIFY_YOUR_NO_WITH
  "continueWith" -> TcSdkOptions.SDK_CONSENT_HEADING_CONTINUE_WITH
  "completeOrderWith" -> TcSdkOptions.SDK_CONSENT_HEADING_COMPLETE_ORDER_WITH
  "placeOrderWith" -> TcSdkOptions.SDK_CONSENT_HEADING_PLACE_ORDER_WITH
  "completeBookingWith" -> TcSdkOptions.SDK_CONSENT_HEADING_COMPLETE_BOOKING_WITH
  "checkoutWith" -> TcSdkOptions.SDK_CONSENT_HEADING_CHECKOUT_WITH
  "manageDetailsWith" -> TcSdkOptions.SDK_CONSENT_HEADING_MANAGE_DETAILS_WITH
  "manageYourDetailsWith" -> TcSdkOptions.SDK_CONSENT_HEADING_MANAGE_YOUR_DETAILS_WITH
  "loginToWithOneTap" -> TcSdkOptions.SDK_CONSENT_HEADING_LOGIN_TO_WITH_ONE_TAP
  "subscribeTo" -> TcSdkOptions.SDK_CONSENT_HEADING_SUBSCRIBE_TO
  "getUpdatesFrom" -> TcSdkOptions.SDK_CONSENT_HEADING_GET_UPDATES_FROM
  "continueReadingOn" -> TcSdkOptions.SDK_CONSENT_HEADING_CONTINUE_READING_ON
  "getNewUpdatesFrom" -> TcSdkOptions.SDK_CONSENT_HEADING_GET_NEW_UPDATES_FROM
  "loginSignupWith" -> TcSdkOptions.SDK_CONSENT_HEADING_LOGIN_SIGNUP_WITH
  else -> null
}

fun mapVerifyMode(key: String): Int? = when (key) {
  "onlyTruecallerUsers" -> TcSdkOptions.OPTION_VERIFY_ONLY_TC_USERS
  "allUsers" -> TcSdkOptions.OPTION_VERIFY_ALL_USERS
  else -> null
}

fun mapDismissOption(key: String): Int? = when (key) {
  "secondaryCtaBorder" -> TcSdkOptions.DISMISS_OPTION_SECONDARY_CTA_BORDER
  "crossButton" -> TcSdkOptions.DISMISS_OPTION_CROSS_BUTTON
  else -> null
}

fun mapConsentMode(key: String): Int? = when (key) {
  "popup" -> TcSdkOptions.CONSENT_MODE_POPUP
  "bottomSheet" -> TcSdkOptions.CONSENT_MODE_BOTTOMSHEET
  else -> null
}
