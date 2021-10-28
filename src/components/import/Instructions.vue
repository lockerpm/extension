<template>
  <div v-if="format" class="locker-callout locker-callout-info">
    <div class="mb-2 font-semibold">{{ title }}</div>
    <div v-if="format === 'cystackcsv' || format === 'cystackjson'">
      See detailed instructions on our help site at
      <a target="_blank" rel="noopener" href="https://cystack.net">
        https://cystack.net
      </a>
    </div>
    <div v-if="format === 'bitwardencsv' || format === 'bitwardenjson'">
      See detailed instructions on our help site at
      <a target="_blank" rel="noopener" href="https://help.bitwarden.com/article/export-your-data/">
        https://help.bitwarden.com/article/export-your-data/</a>
    </div>
    <div v-if="format === 'lastpasscsv'">
      See detailed instructions on our help site at
      <a target="_blank" rel="noopener" href="https://help.bitwarden.com/article/import-from-lastpass/">
        https://help.bitwarden.com/article/import-from-lastpass/</a>
    </div>
    <div v-if="format === 'keepassxcsv'">
      Using the KeePassX desktop application, navigate to "Database" &rarr; "Export to CSV file" and save the CSV
      file.
    </div>
    <div v-if="format === 'aviracsv'">
      In the Avira web vault, go to "Settings" &rarr; "My Data" &rarr; "Export data" and save the CSV file.
    </div>
    <div v-if="format === 'blurcsv'">
      In the Blur web vault, click your username at the top and go to "Settings" &rarr; "Export Data", then click
      "Export CSV"
      for your "Accounts".
    </div>
    <div v-if="format === 'safeincloudxml'">
      Using the SaveInCloud desktop application, navigate to "File" &rarr; "Export" &rarr; "As XML" and save the
      XML file.
    </div>
    <div v-if="format === 'padlockcsv'">
      Using the Padlock desktop application, click the hamburger icon in the top left corner and navigate to
      "Settings" &rarr;
      "Export" button and save the file "As CSV".
    </div>
    <div v-if="format === 'keepass2xml'">
      Using the KeePass 2 desktop application, navigate to "File" &rarr; "Export" and select the "KeePass XML
      (2.x)" option.
    </div>
    <div v-if="format === 'upmcsv'">
      Using the Universal Password Manager desktop application, navigate to "Database" &rarr; "Export" and save
      the CSV file.
    </div>
    <div v-if="format === 'saferpasscsv'">
      Using the SaferPass browser extension, click the hamburger icon in the top left corner and navigate to
      "Settings". Click the "Export accounts" button to save the CSV file.
    </div>
    <div v-if="format === 'meldiumcsv'">
      Using the Meldium web vault, navigate to "Settings". Locate the "Export data" function and click "Show me my
      data" to save the CSV file.
    </div>
    <div v-if="format === 'keepercsv'">
      Log into the Keeper web vault (keepersecurity.com/vault). Navigate to "Backup" (top right) and find the
      "Export to .csv File" option. Click "Export Now" to save the CSV file.
    </div>
    <div v-if="format === 'chromecsv' || format === 'operacsv' || format === 'vivaldicsv'">
      <span v-if="format !== 'chromecsv'">
        The process is exactly the same as importing from Google Chrome.
      </span>
      See detailed instructions on our help site at
      <a target="_blank" rel="noopener" href="https://help.bitwarden.com/article/import-from-chrome/">
        https://help.bitwarden.com/article/import-from-chrome/</a>
    </div>
    <div v-if="format === 'firefoxcsv'">
      See detailed instructions on our help site at
      <a target="_blank" rel="noopener" href="https://bitwarden.com/help/article/import-from-firefox/">
        https://bitwarden.com/help/article/import-from-firefox/</a>.
    </div>
    <div v-if="format === '1password1pif' || format === '1passwordwincsv' || format === '1passwordmaccsv'">
      See detailed instructions on our help site at
      <a target="_blank" rel="noopener" href="https://help.bitwarden.com/article/import-from-1password/">
        https://help.bitwarden.com/article/import-from-1password/</a>.
    </div>
    <div v-if="format === 'passworddragonxml'">
      Using the Password Dragon desktop application, navigate to "File" &rarr; "Export" &rarr; "To XML". In the
      dialog that pops up select "All Rows" and check all fields. Click the "Export" button and save the XML file.
    </div>
    <div v-if="format === 'enpasscsv'">
      Using the Enpass desktop application, navigate to "File" &rarr; "Export" &rarr; "As CSV". Select "OK" to the
      warning alert and save the CSV file. Note that the importer only supports files exported while Enpass is set
      to the English language, so adjust your settings accordingly.
    </div>
    <div v-if="format === 'enpassjson'">
      Using the Enpass 6 desktop application, click the menu button and navigate to "File" &rarr; "Export".
      Select the ".json" file format option and save the JSON file.
    </div>
    <div v-if="format === 'pwsafexml'">
      Using the Password Safe desktop application, navigate to "File" &rarr; "Export To" &rarr; "XML format..."
      and save the XML file.
    </div>
    <div v-if="format === 'dashlanejson'">
      Using the Dashlane desktop application, navigate to "File" &rarr; "Export" &rarr; "Unsecured archive
      (readable) in JSON format" and save the JSON file.
    </div>
    <div v-if="format === 'msecurecsv'">
      Using the mSecure desktop application, navigate to "File" &rarr; "Export" &rarr; "CSV File..." and save the
      CSV file.
    </div>
    <div v-if="format === 'stickypasswordxml'">
      Using the Sticky Password desktop application, navigate to "Menu" (top right) &rarr; "Export" &rarr; "Export
      all". Select the unencrypted format XML option and save the XML file.
    </div>
    <div v-if="format === 'truekeycsv'">
      Using the True Key desktop application, click the gear icon (top right) and then navigate to "App Settings".
      Click the "Export" button, enter your password and save the CSV file.
    </div>
    <div v-if="format === 'clipperzhtml'">
      Log into the Clipperz web application (clipperz.is/app). Click the hamburger menu icon in the top right to
      expand the navigation bar. Navigate to "Data" &rarr; "Export". Click the "download HTML+JSON" button to save
      the HTML file.
    </div>
    <div v-if="format === 'roboformcsv'">
      Using the RoboForm Editor desktop application, navigate to "RoboForm" (top left) &rarr; "Options" &rarr;
      "Account &amp; Data" and click the "Export" button. Select all of your data, change the "Format" to "CSV
      file" and then click the "Export" button to save the CSV file. Note: RoboForm only allows you to export
      Logins. Other items will not be exported.
    </div>
    <div v-if="format === 'passboltcsv'">
      Log into the Passbolt web vault and navigate to the "Passwords" listing. Select all of the passwords you
      would like to export and click the "Export" button at the top of the listing. Choose the "csv (lastpass)"
      export format and click the "Export" button.
    </div>
    <div v-if="format === 'ascendocsv'">
      Using the Ascendo DataVault desktop application, navigate to "Tools" &rarr; "Export". In the dialog that
      pops up, select the "All Items (DVX, CSV)" option. Click the "Ok" button to save the CSV file.
    </div>
    <div v-if="format === 'passwordbossjson'">
      Using the Password Boss desktop application, navigate to "File" &rarr; "Export data" &rarr; "Password Boss
      JSON - not encrypted" and save the JSON file.
    </div>
    <div v-if="format === 'zohovaultcsv'">
      Log into the Zoho web vault (vault.zoho.com). Navigate to "Tools" &rarr; "Export Secrets". Select "All
      Secrets" and click the "Zoho Vault Format CSV" button. Highlight and copy the data from the textarea. Open a
      text editor like Notepad and paste the data. Save the data from the text editor as
      <code>zoho_export.csv</code>.
    </div>
    <div v-if="format === 'splashidcsv'">
      Using the SplashID Safe desktop application, click on the SplashID blue lock logo in the top right corner.
      Navigate to "Export" &rarr; "Export as CSV" and save the CSV file.
    </div>
    <div v-if="format === 'passkeepcsv'">
      Using the PassKeep mobile app, navigate to "Backup/Restore". Locate the "CSV Backup/Restore" section and
      click "Backup to CSV" to save the CSV file.
    </div>
    <div v-if="format === 'gnomejson'">
      Make sure you have python-keyring and python-gnomekeyring installed. Save the
      <a target="_blank" rel="noopener" href="https://bit.ly/2GpOMTg">GNOME Keyring Import/Export</a> python
      script to your desktop as <code>pw_helper.py</code>. Open terminal and run
      <code>chmod +rx Desktop/pw_helper.py</code> and then
      <code>python Desktop/pw_helper.py export Desktop/my_passwords.json</code>. Then upload the resulting
      <code>my_passwords.json</code> file here to CyStack Locker.
    </div>
    <div v-if="format === 'passwordagentcsv'">
      Using the Password Agent desktop application navigate to "File" &rarr; "Export", select the "Fields to
      export" button and check all of the fields, change the "Output format" to "CSV", and then click the "Start"
      button to save the CSV file.
    </div>
    <div v-if="format === 'passpackcsv'">
      Log into the Passpack website vault and navigate to "Settings" &rarr; "Export", then click the "Download"
      button to save the CSV file.
    </div>
    <div v-if="format === 'passmanjson'">
      Open your Passman vault and click on "Settings" in the bottom left corner. In the "Settings" window switch
      to the "Export credentials" tab and choose "JSON" as the export type. Enter your vault's passphrase and
      click the "Export" button to save the JSON file.
    </div>
    <div v-if="format === 'avastcsv'">
      Open the Avast Passwords desktop application and navigate to "Settings" &rarr; "Import/export data". Select
      the "Export" button for the "Export to CSV file" option to save the CSV file.
    </div>
    <div v-if="format === 'avastjson'">
      Open the Avast Passwords desktop application and navigate to "Settings" &rarr; "Import/export data". Select
      the "Export" button for the "Export to JSON file" option to save the JSON file.
    </div>
    <div v-if="format === 'fsecurefsk'">
      Open the F-Secure KEY desktop application and navigate to "Settings" &rarr; "Export Passwords". Select the
      "Export" button, enter your master password, and save the FSK file.
    </div>
    <div v-if="format === 'kasperskytxt'">
      Open the Kaspersky Password Manager desktop application and navigate to "Settings" &rarr; "Import/Export".
      Locate the "Export to text file" section and select the "Export" button to save the TXT file.
    </div>
    <div v-if="format === 'remembearcsv'">
      Open the RememBear desktop application and navigate to "Settings" &rarr; "Account" &rarr; "Export".
      Enter your master password and select the "Export Anyway" button to save the CSV file.
    </div>
    <div v-if="format === 'passwordwallettxt'">
      Open the PasswordWallet desktop application and navigate to "File" &rarr; "Export" &rarr;
      "Visible entries to text file". Enter your password and select the "Ok" button to save the TXT file.
    </div>
    <div v-if="format === 'mykicsv'">
      Open the Myki desktop browser extension and navigate to "Advanced" &rarr; "Export Accounts" and then scan
      the QR code with your mobile device. Various CSV files will then be saved to your computer's
      downloads folder.
    </div>
    <div v-if="format === 'securesafecsv'">
      Export your SecureSafe password safe to a CSV file with a comma delimiter.
    </div>
    <div v-if="format === 'logmeoncecsv'">
      Open the LogMeOnce browser extension, then navigate to "Open Menu" &rarr; "Export To" and
      select "CSV File" to save the CSV file.
    </div>
    <div v-if="format === 'blackberrycsv'">
      Open the BlackBerry Password Keeper application, then navigate to "Settings" &rarr; "Import/Export".
      Select "Export Passwords" and follow the instructions on screen to save the unencrypted CSV file.
    </div>
    <div v-if="format === 'buttercupcsv'">
      Open the Buttercup desktop application and unlock your vault. Right click on your vault's icon and
      select "Export" to save the CSV file.
    </div>
    <div v-if="format === 'codebookcsv'">
      Open the Codebook desktop application and log in. Navigate to "File" &rarr; "Export all", then click
      "Yes" on the dialog and save the CSV file.
    </div>
    <div v-if="format === 'encryptrcsv'">
      Open the newest version of the Encryptr desktop application and allow all of your data to sync.
      Once syncing of your data is complete, the download icon in the top right corner will turn pink. Click
      the download icon and save the CSV file.
    </div>
    <div v-if="format === 'yoticsv'">
      From the Yoti browser extension, click on "Settings", then "Export Saved Logins" and save the CSV file.
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
export default Vue.extend({
  props: {
    format: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  }
})
</script>
