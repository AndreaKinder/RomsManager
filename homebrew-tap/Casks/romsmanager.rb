cask "romsmanager" do
  version "0.5.0-alpha"
  sha256 :no_check

  url "https://github.com/andreakinder/RomsManager/releases/download/v#{version}/ROM%20Manager.dmg",
      verified: "github.com/andreakinder/RomsManager/"
  name "ROM Manager"
  desc "Desktop application for managing retro game ROMs with SD card sync capabilities"
  homepage "https://github.com/andreakinder/RomsManager"

  depends_on macos: ">= :big_sur"

  app "ROM Manager.app"

  zap trash: [
    "~/Library/Application Support/romsmanager",
    "~/Library/Preferences/com.andreakinder.romsmanager.plist",
    "~/Library/Saved Application State/com.andreakinder.romsmanager.savedState",
  ]
end
