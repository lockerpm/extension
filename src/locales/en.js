module.exports = {
  common: {
    username: 'Username',
    password: 'Password',
    share: 'Share',
    copy: 'Copy',
    move_folder: 'Move folder',
    delete: 'Delete',
    success: 'Success',
    warning: 'Warning',
    failed: 'Failed',
    copied: 'Copied to clipboard',
    clone: 'Clone',
    restore: 'Restore',
    permanently_delete: 'Permanently Delete',
    add: 'Add',
    update: 'Update',
    note: 'Note',
    edit: 'Edit',
    folder: 'Folder',
    invite: 'Invite',
    upgrade: 'Upgrade',
    lock: 'Lock',
    logout: 'Log Out',
    groups: 'Groups',
    remove: 'Remove',
    users: 'Users',
    rename: 'Rename',
    collections: 'Team folders',
    length: 'Length',
    me: 'Me',
    purge: 'Purge Account',
    delete_account: 'Delete Account',
    confirm: 'Confirm',
    cardholder: "Cardholder's name",
    cardholder_placeholder: 'Jane Doe',
    email_placeholder: 'Enter your email',
    first_name_placeholder: 'Enter your first name',
    last_name_placeholder: 'Enter your last name',
    email: 'Email address',
    email_address: 'Email address',
    email_address_placeholder: 'Enter your email',
    name: 'Name',
    full_name_placeholder: 'Enter your full name',
    address: 'Address',
    address_placeholder: 'Enter your address',
    company: 'Company',
    company_size: 'Number of staffs',
    company_placeholder: 'Enter your company',
    company_size_placeholder: 'Choose number of staffs',
    phone: 'Phone number',
    phone_placeholder: 'Enter your phone',
    city: 'City',
    state: 'Province/State',
    zip: 'Postal/Zip Code',
    country: 'Country',
    country_placeholder: 'Select your country',
    cancel: 'Cancel',
    save: 'Save',
    folder_name: 'Folder name',
    group_name: 'Group name',
    ownership: 'Ownership',
    master_password: 'Master Password',
    joined: 'Joined at',
    close: 'Close',
    status: 'Status',
    amount: 'Amount',
    duration: 'Duration',
    yearly: '1 year plan',
    monthly: '1 month plan',
    half_yearly: '6 months plan',
    created_date: 'Created date',
    plan: 'Plan',
    go_to_website: 'Go to website',
    accept: 'Accept',
    reject: 'Reject',
    shared_with_you: 'Shared with you in CyStack'
  },
  sidebar: {
    all: 'All',
    passwords: 'Passwords',
    dashboard: 'Dashboard',
    vault: 'Vault',
    notes: 'Notes',
    cards: 'Cards',
    identities: 'Identities',
    shares: 'Shares',
    trash: 'Trash',
    users: 'Users',
    groups: 'Groups',
    shared_folders: 'Shared folders',
    settings: 'Settings',
    general: 'General',
    import_export: 'Import Export',
    download: 'Download',
    excluded_domains: 'Excluded Domains',
    upgrade: 'Upgrade',
    tools: 'Tools',
    logs: 'Logs',
    overview: 'Overview',
    billing: 'Billing',
    family_members: 'Family Members',
    policies: 'Policies'
    
  },
  errors: {
    confirm_password: 'Master password confirmation does not match',
    invalid_password: 'Your password is invalid, please try again',
    invalid_master_password: 'Your master password is invalid, please try again',
    111111: 'The payment method has already existed.',
    invalid_number: 'Your card number is invalid.',
    incomplete_number: 'Your card number is incomplete.',
    incomplete_cvc: "Your card's security code is incomplete.",
    incomplete_expiry: "Your card's expiration date is incomplete.",
    invalid_expiry_year: "Your card's expiration year is invalid.",
    invalid_expiry_year_past: "Your card's expiration year is in the past."
  },
  master_password: {
    create_success: 'Your Master Password has been created!',
    create_failed: 'Your Master Password has not been created!',
    scores: {
      na: 'N/A',
      very_weak: 'Rất yếu',
      weak: 'Yếu',
      medium: 'Trung bình',
      good: 'Tốt',
      strong: 'Mạnh'
    },
    change: 'Change Master Password',
    current_password: 'Enter current Master Password',
    new_password: 'Enter new Master Password',
    re_password: 'Re-Enter new Master Password',
    change_btn: 'Change password',
    enter_password: 'Enter Master Password',
    enter_password_desc: 'Enter your Master Password',
    enter_password_title: 'Login',
    get_hint: 'Get master password hint',
    continue: 'Continue',
    master_password_hint: 'Master password hint',
    master_password_hint_desc: 'Master password hint will be sent to your email address',
    send: 'Send',
    back_login: 'Back to Login',
    sorry: 'Sorry, your Master Password hint has not created yet.',
    hint_success: 'Please check your inbox for instructions.',
    unlock: 'Unlock'
  },
  enum: {
    Login: 'Password | Password',
    SecureNote: 'Notes | Notes',
    Card: 'Cards | Cards',
    Identity: 'Identities | Identities',
    null: 'Trash'
  },
  type: {
    1: 'Password | Passwords',
    2: 'Note | Notes',
    3: 'Card | Cards',
    4: 'Identity | Identities',
    0: 'Item | Items',
    Login: 'Password | Password',
    SecureNote: 'Note | Notes',
    Card: 'Card | Cards',
    Identity: 'Identity | Identities',
    Dashboard: 'Item | Items',
    Vault: 'Item | Items',
    Shares: 'Item | Items'
  },
  data: {
    notifications: {
      create_success: 'The {type} has been added! | The {type} have been added!',
      create_failed: 'The {type} has not been added! | The {type} have not been added!',
      update_success: 'The {type} has been updated! | The {type} have been updated!',
      update_failed: 'The {type} has been updated! | The {type} have been updated!',
      trash_success: 'The {type} has been moved to trash! | The {type} have been moved to trash!',
      trash_failed: 'The {type} has not been moved to trash! | The {type} have been moved to trash!',
      delete_success: 'The {type} has been permanently deleted! | The {type} have been permanently deleted!',
      delete_failed: 'The {type} has not been permanently deleted! | The {type} have not been permanently deleted!',
      restore_success: 'The {type} has been restored! | The {type} have been restored!',
      restore_failed: 'The {type} has not been restored! | The {type} have not been restored!',
      delete_selected: 'Delete selected',
      delete_selected_desc: 'Are you sure you want to permanently delete this item | You have selected {count} item(s) to permanently delete. Are you sure you want to permanently delete all of these items?',
      trash_selected: 'Delete selected',
      trash_selected_desc: 'Do you really want to send to the trash? | You have selected {count} item(s) to delete. Are you sure you want to delete all of these items?',
      restore_selected: 'Restore selected',
      restore_selected_desc: 'Are you sure you want to restore this item? | You have selected {count} item(s) to restore. Are you sure you want to restore all of these items?',
      move_selected: 'Move selected',
      move_selected_desc: 'Choose a folder that you would like to move the {count} selected item(s) to.',
      overwrite_password: 'Are you sure you want to overwrite the current password?',
      move_success: 'The item has been moved! | The items have been moved!',
      move_failed: 'The item has not been moved! | The items have not been moved!',
      deleted_folder: 'After folder deleted, all items will be moved to trash. Are you sure you want to delete the folder?',
      deleted_team_folder: 'After Team folder deleted, all items which belong to no Team folder will be moved to Unassigned Folder. Are you sure you want to delete this Team folder?',
      add_member_success: 'The member has been invited!',
      add_member_failed: 'The member has not been invited!',
      delete_member_success: 'The member has been deleted!',
      delete_member_failed: 'The member has not been deleted!',
      delete_member_description: 'Are you sure you want to remove this user?',
      update_member_success: 'The member has been updated!',
      update_member_failed: 'The member has not been updated!',
      confirm_member_success: 'The member has been confirmed!',
      confirm_member_failed: 'The member has not been confirmed!',
      reject_member_success: 'The invitation has been rejected!',
      reject_member_failed: 'The invitation has not been rejected!',
      accept_member_success: 'The invitation has been accepted!',
      accept_member_failed: 'The invitation has not been accepted!',
      update_settings_success: 'Your settings have been updated!',
      update_settings_failed: 'Your settings have not been updated!',
      update_master_success: 'Your master password have been updated!',
      update_master_failed: 'Your master password have not been updated!',
      add_group_success: 'The group has been added!',
      add_group_failed: 'The group has not been added!',
      delete_group_success: 'The group has been deleted!',
      delete_group_failed: 'The group has not been deleted!',
      delete_group_description: 'Are you sure you want to remove this group?',
      update_group_success: 'The group has been updated!',
      update_group_failed: 'The group has not been updated!',
      add_folder_success: 'The folder has been added!',
      add_folder_failed: 'The folder has not been added!',
      delete_folder_success: 'The folder has been deleted!',
      delete_folder_failed: 'The folder has not been deleted!',
      delete_folder_description: 'Are you sure you want to remove this folder?',
      update_folder_success: 'The folder has been updated!',
      update_folder_failed: 'The folder has not been updated!',
      purge_success: 'Your vault has been purged!',
      purge_failed: 'Your vault has not been purged!',
      purge_title: 'Delete all account items',
      purge_description: 'Proceed below to delete all items and folders in your vault. Items that belong to an organization that you share with will not be deleted.',
      delete_account_success: 'Your Locker account has been deleted!',
      delete_account_failed: 'Your Locker account has not been deleted!',
      delete_account_title: 'Delete Locker Account',
      delete_account_description: 'Proceed below to delete your account and all associated data.',
      purge_team_success: 'Your Team\'s vault has been purged!',
      purge_team_failed: 'Your Team\'s vault has not been purged!',
      purge_team_title: 'Delete all Team\'s vault.',
      purge_team_description: 'Proceed below to delete all items in the Team\'s vault.',
      update_team_success: 'Your Team has been updated!',
      update_team_failed: 'Your Team has not been updated!',
      fingerprint_title: 'Verify fingerprint phrase',
      fingerprint_description_1: 'To ensure the integrity of your encryption keys, please verify the user\'s fingerprint phrase before continuing.',
      fingerprint_description_2: 'A \'fingerprint phrase\' is a unique word phrase (similar to a passphrase) that a user can use to authenticate their public key with another user, for the purposes of sharing.',
      min_password_length: 'Minimum password length is {length}',
      max_password_length: 'Maximum password length is {length}',
      password_composition: 'Password must contain at least 1 special character'
    },
    profile_menu: {
      lock: 'Lock your account',
      logout: 'Logout',
      account_settings: 'Account Settings',
      support_center: 'Support Center',
      tour: 'Welcome Tour',
      feedback: 'Give Feedback'
    },
    admin_menu: {
      my_vault: 'My Vault',
      team_profile: 'Team Profile',
      change_team: 'Change Team'
    },
    no_data: {
      Dashboard: {
        title: 'Hãy bắt đầu nào!',
        description: 'Thêm mục đầu tiên của bạn. Bạn sẽ tìm thấy nó ở đây bất cứ khi nào bạn cần',
        btn: 'Thêm danh mục',
        btn_import: 'Nhập danh mục'
      },
      Vault: {
        title: 'Hãy bắt đầu nào!',
        description: 'Thêm mục đầu tiên của bạn. Bạn sẽ tìm thấy nó ở đây bất cứ khi nào bạn cần',
        btn: 'Thêm danh mục',
        btn_import: 'Nhập danh mục'
      },
      Login: {
        title: 'Hãy bắt đầu nào!',
        description: 'Thêm mật khẩu của bạn và truy cập chúng trên mọi thiết bị, bất cứ lúc nào',
        btn: 'Thêm mật khẩu',
        btn_import: 'Nhập mật khẩu'
      },
      SecureNote: {
        title: 'Giải phóng bộ nhớ của bạn',
        description: 'Lưu lại mã Wi-Fi, mã báo động an ninh văn phòng hoặc ngày sinh của bạn bè bạn...',
        btn: 'Thêm ghi chú'
      },
      Card: {
        title: 'Mua sắm tiện lợi nhanh chóng',
        description: 'Thêm chi tiết thẻ thanh toán để tự động điền khi mua sắm trực tuyến',
        btn: 'Thêm Thẻ thanh toán'
      },
      Identity: {
        title: 'Mua sắm tiện lợi nhanh chóng',
        description: 'Thêm chi tiết thẻ thanh toán để tự động điền khi mua sắm trực tuyến',
        btn: 'Thêm Thẻ danh tính'
      },
      Trash: {
        title: 'Thùng rác trống',
        description: 'Tất cả thư mục được chuyển vào Thùng rác đều có thể được khôi phục cho đến khi bạn xóa chúng vĩnh viễn'
      },
      Shares: {
        title: 'Không có mục nào được chia sẻ',
        description: 'Các mục được chia sẻ giữa bạn và người khác sẽ xuất hiện ở đây',
        btn: 'Thêm danh mục'
      }
    },
    members: {
      role: {
        admin: {
          title: 'Admin',
          description: 'Admins can access and manage all items, collections and users in your organization'
        },
        manager: {
          title: 'Manager',
          description: 'Managers can access and manage assigned collections in your organization'
        },
        member: {
          title: 'Member',
          description: 'A regular user with access to assigned collections in your team'
        },
        owner: {
          title: 'Owner'
        },
        family: {
          title: 'Family member'
        }
      }
    },
    timeouts: {
      oneMinute: '1 minute',
      fiveMinutes: '5 minutes',
      tenMinutes: '10 minutes',
      fifteenMinutes: '15 minutes',
      thirtyMinutes: '30 minutes',
      oneHour: '1 hour',
      fourHours: '4 hours',
      onRefresh: 'On Browser Reload'
    },
    exportFile: {
      export: 'Export',
      export_items: 'Export Items',
      export_items_desc: 'Enter your master password to export your vault data.',
      csv: 'CSV',
      json: 'JSON',
      encrypted_json: 'Encrypted JSON'
    },
    importFile: {
      import: 'Import',
      import_items: 'Import Items',
      import_items_desc: 'Transfer passwords and other items from browser or files.',
      select_file: '1. Select the format of the import file',
      select_format: '2. Select the format of the import file',
      or_copy: 'or copy/paste the import file contents',
      instructions: '{name} Instructions'
    },
    plans: {
      price: {
        price: '1 month plan',
        half_yearly_price: '6 months plan',
        yearly_price: '1 year plan'
      },
      members: '{count} member | {count} members',
      features: {
        store_password: 'Store Unlimited Passwords',
        cards_and_notes: 'Keep Credit Cards and Notes',
        password_generator: 'Password Generator',
        sync_devices: 'Sync Unlimited Devices',
        password_health: 'Password Health',
        data_breach: 'Data Breach Scanner',
        shares_passwords: 'Share Company Vault',
        admin_panel: 'Admin Panel',
        activity_logs: 'Activity Logs'
      }
    },
    billing: {
      card_number: 'Card number',
      expiration: 'Expiration',
      cvc: 'CVV',
      payment_method: 'Payment methods',
      billing_contact: 'Billing contact',
      billing_address: 'Billing address',
      card_title: 'Enter Your Payment Information',
      email_hint: 'We will send invoices to this email',
      card_decline: {
        generic_decline: 'The card has been declined for an unknown reason. You needs to contact your card issuer for more information.'
      },
      add_card_success: 'Your payment method has been added!',
      add_card_failed: 'Your payment method has not been added!',
      delete_card_success: 'Your payment method has been removed!',
      delete_card_failed: 'Your payment method has not been removed!',
      remove_btn: 'Remove credit card',
      change_btn: 'Change credit card',
      add_btn: 'Add credit card',
      not_have: 'This account does not have a credit card.',
      billed_to: 'This account is billed to',
      card_ending: '{name} card ending in',
      billing_information: 'Billing Information',
      confirm_delete_card: 'Remove the payment method',
      confirm_delete_card_all: 'If you remove this card, all of your subscriptions will be cancelled? Are you sure to remove this payment method?',
      next_billing: 'Next billing date',
      total_after_trial: 'Total monthly recurring payment after Trial',
      charged_today: 'Amount charge today',
      upgrade_summary: 'Upgrade summary',
      checkout: 'Checkout',
      checkout_hint: 'When the trial end CyStack will automatically continue your subscription. You can still cancel at any time.',
      required_ownership: 'Required ownership verification',
      total_monthly: 'Monthly Total',
      total_yearly: 'Yearly Total',
      additions_members: 'Additional team members',
      past_due: 'Past due',
      paid: 'Paid',
      failed: 'Failed',
      pending: 'Pending',
      processing: 'Processing',
      invoice_id: 'Invoice ID',
      pay_success: 'Your payment was successful!',
      pay_failed: 'Your payment was unsuccessful!',
      view_details: 'View details',
      promo: 'Promotion code',
      promotion_code: 'Have Promo Code?',
      promotion_placeholder: 'Enter promo code here',
      apply: 'APPLY',
      plan_item: 'Plan {name} {duration} subscription',
      unsubscribe_success: 'Your subscription will be removed! Your plan will be downgrade to Free after {date}',
      unsubscribe_failed: 'Your subscription has not been removed!',
      subscribe_success: 'Your subscription has been updated!',
      subscribe_failed: 'Your subscription has not been updated!',
      restart_success: 'Your subscription has been restarted!',
      restart_failed: 'Your subscription has not been restarted!',
      confirm_unsubscribe: 'Are you sure you want to cancel your subscription? Your plan will be downgraded to Free after {date}',
      confirm_restart: 'Are you sure you want to restart your subscription?',
      restart: 'Restart',
      upgrading: 'Upgrading to',
      payment_due: 'Payment due',
      intro: "Please enter your card details (Visa, MasterCard, American Express, Discover, etc).<br><br>We use <a class='kt-link' href='https://stripe.com/' rel='noopener' target='_blank'>Stripe</a>, one of the top payment gateways in the world, as our payment processor and do not store any of your card information on our side.",
      total: 'Total',
      transfer_information: 'Transfer information',
      transfer_note: 'Copy the exact content of the transaction when making the transfer. The system will automatically process your transactions.',
      transfer_detail: 'Transfer detail',
      transfer_bank: 'Bank name',
      transfer_branch: 'Bank branch',
      transfer_account: 'Account holder name',
      transfer_account_number: 'Account number',
      transfer_amount: 'Amount',
      transfer_content: 'Content',
      transfer_already: 'I have already transferred',
      transfer_thank: 'Thank you',
      transfer_thank_content: 'We are reviewing your transaction. Your account will be upgraded to {plan} in 5 minutes.',
      transfer_thank_content_1: 'Wrong transaction code? Please contact us via Help Center for manual review.',
      cancel_subscription: 'Cancel Subscription',
      invoices: 'Invoices',
      cancel_at_period_end: 'Your plan will downgrade at'
    },
    groups: {
      access_all: 'This group can access all items.',
      access_selected: 'This group can access only the selected collections',
      edit_group: 'Edit group',
      add_group: 'Add group',
      user_access: 'User access',
      groups: 'Groups'
    },
    users: {
      edit_user: 'Edit user',
      add_user: 'Add user',
      add_family: 'Add family member',
      edit_family: 'Edit family member'
    },
    folders: {
      edit_folder: 'Edit folder',
      add_folder: 'Add folder',
      edit_team_folder: 'Edit Team folder',
      add_team_folder: 'Add Team folder',
      groups_access: 'Group access',
      user_access: 'User access',
      move_to: 'Move to',
      move_to_desc: 'Choose a folder that you would like to move the 1 selected item(s) to.',
      no_folder: 'No folder',
      select_folder: 'Select a folder'
    },
    ciphers: {
      add_cipher: 'Add item',
      password_security: 'Password Security',
      website_address: 'Website address',
      password: 'Password',
      card_holder: 'Cardholder name',
      brand: 'Brand',
      card_number: 'Card number',
      expiration_month: 'Expiration month',
      expiration_year: 'Expiration year',
      cvv: 'Security Code (CVV)',
      notes: 'Notes',
      name: 'Name',
      folder: 'Folder',
      title: 'Title',
      first_name: 'First name',
      last_name: 'Last name',
      company: 'Company',
      ssn: 'Social security number',
      passport: 'Passport number',
      license: 'License number',
      phone: 'Phone',
      address: 'Address',
      city_town: 'City / Town',
      state_province: 'State / Province',
      zip: 'Zip / Postal code',
      country: 'Country',
      owned_by: 'Owned by',
      personal: 'Personal information',
      contact: 'Contact information',
      login: 'Login information',
      others: 'Others',
      choose_at_least_folder: 'Only team users with access to these folders will be able to see this item. Choose at least 1 folder.',
      choose_a_team: 'Choose a team that you wish to share this item with. Sharing transfers ownership of the item to the team. You will no longer be the direct owner of this item once it has been shared.',
      folders_team: 'Folders Team',
      sort_by: 'Sort by',
      ascending: 'Ascending',
      descending: 'Descending',
      time: 'Time',
      updated_time: 'Updated time',
      unassigned_folder: 'Unassigned Folder',
      all_items: 'All items',
      add_item: 'Add item',
      selected_items: 'selected items',
      generate_random_password: 'Generate random password',
      show_password: 'Show password'
    },
    settings: {
      account: 'Account',
      plan: 'Plan',
      manage_plan: 'Manage plan',
      manage: 'Manage',
      fingerprint: 'Fingerprint',
      options: 'Options',
      timeout: 'Timeout',
      timeout_desc: 'Automatically locks the app after a chosen period of device inactivity',
      timeout_action: 'Timeout Action',
      timeout_action_1: 'A locked vault requires that you re-enter your master password to access it again.',
      timeout_action_2: 'A logged out vault requires that you re-authenticate to access it again.',
      security: 'Security',
      change_master_password: 'Change Master Password',
      emergency_access: 'Emergency Access',
      danger_zone: 'Danger zone',
      danger_zone_note: 'Careful, these actions are not reversible!',
      delete_all_items: 'Delete all account items',
      delete_account: 'Delete account',
      language: 'Language',
      vietnamese: 'Tiếng Việt',
      english: 'English',
      deauthorize_sessions: 'Deauthorize Sessions',
      deauthorize_sessions_title: 'Concerned your account is logged in on another device? Proceed below to deauthorize all computers or devices that you have previously used. This security step is recommended if you previously used a public computer or accidentally saved your password on a device that isn\'t yours.',
      deauthorize_sessions_desc: 'Proceeding will also log you out of your current session, requiring you to log back in.',
      deauthorize_sessions_success: 'All Sessions Deauthorized',
      deauthorize_sessions_failed: 'Something went wrong'
    },
    tools: {
      password_generator: 'Password Generator',
      password_generator_desc: 'Create secure passwords for your accounts',
      password_health: 'Password Health',
      password_health_desc: 'Identify passwords that can put you at risk',
      data_breach: 'Data Breach Scanner',
      data_breach_desc: 'Check if your sensitive data has been leaked online',
      copy_password: 'Copy Password',
      show_options: 'Show Options',
      uppercase: 'Use uppercase letters (A-Z)',
      lowercase: 'Use lowercase letters (a-z)',
      digits: 'Use digits (0-9)',
      symbols: 'Use symbols (@!$%*)',
      ambiguous: 'Avoid ambiguous characters'
    }
  }
}
