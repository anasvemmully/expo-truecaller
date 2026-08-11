import Foundation

func mapTcErrorCode(_ code: Int) -> String {
  switch code {
  case 1: return "IOS_APP_KEY_MISSING"
  case 2: return "IOS_APP_LINK_MISSING"
  case 3: return "USER_DISMISSED_CONSENT_SCREEN"
  case 4: return "IOS_USER_NOT_SIGNED_IN"
  case 5, 6, 7: return "SDK_TOO_OLD" // TruecallerTooOld / SdkTooOld / OSNotSupported
  case 8: return "NOT_INSTALLED"
  case 9: return "NETWORK_ERROR"
  case 12: return "INVALID_PARTNER_CONFIGURATION" // UnauthorizedDeveloper
  case 19: return "IOS_UNIVERSAL_LINK_FAILED"
  case 20: return "IOS_URL_SCHEME_MISSING"
  case 10, 11, 13, 14, 15, 16, 17, 18: return "INTERNAL_ERROR"
  default: return "UNKNOWN"
  }
}
