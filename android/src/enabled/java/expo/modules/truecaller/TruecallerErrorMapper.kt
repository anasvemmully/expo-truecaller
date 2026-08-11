package expo.modules.truecaller

fun mapTcErrorCode(errorCode: Int): String = when (errorCode) {
  2 -> "USER_DISMISSED_CONSENT_SCREEN" // UserDeniedError
  5 -> "TRUECALLER_CLOSED_UNEXPECTEDLY" // TruecallerClosedError
  6 -> "SDK_TOO_OLD" // OldSdkError
  7 -> "REQUEST_CODE_CONFLICT" // RequestCodeCollisionError
  10 -> "INVALID_ACCOUNT_STATE" // InvalidAccountStateError
  11 -> "NOT_INSTALLED" // TruecallerNotInstalledError
  12 -> "INVALID_PARTNER_CONFIGURATION" // InvalidPartnerError
  13 -> "USER_DENIED_WHILE_LOADING" // UserDeniedWhileLoadingError
  14 -> "USER_DENIED_FOOTER_BUTTON" // UserDeniedByPressingFooterError
  15 -> "ACTIVITY_NOT_FOUND" // TruecallerActivityNotFoundError
  16 -> "UNSUPPORTED_OS_VERSION" // DeviceNotSupported
  else -> "UNKNOWN" // 0 = DefaultError ("Something went wrong")
}
