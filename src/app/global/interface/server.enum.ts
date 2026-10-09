export enum ServerRequestActionEnum {
  FindAll='findAll', FindOne='findOne', FindBy='findBy', FindMany='findMany', Search='search', Query='query', Count='count', Exists='exists', Distinct='distinct', Aggregate='aggregate',
  Create='create', CreateMany='createMany', Update='update', UpdateMany='updateMany', Replace='replace', Delete='delete', DeleteMany='deleteMany', Restore='restore', RestoreMany='restoreMany',
  Enable='enable', Disable='disable', Activate='activate', Deactivate='deactivate', Lock='lock', Unlock='unlock', Archive='archive', Unarchive='unarchive',
  Validate='validate', Verify='verify', Check='check', Approve='approve', Reject='reject', Confirm='confirm', Cancel='cancel',
  Login='login', Logout='logout', Register='register', RefreshToken='refreshToken', VerifyToken='verifyToken', ResetPassword='resetPassword', ChangePassword='changePassword', ForgotPassword='forgotPassword',
  Authorize='authorize', Grant='grant', Revoke='revoke', Assign='assign', Unassign='unassign',
  Import='import', ImportMany='importMany', Export='export', Download='download', Upload='upload',
  Clone='clone', Duplicate='duplicate', Copy='copy', Move='move', Rename='rename',
  Sync='sync', Refresh='refresh', Reload='reload', Rebuild='rebuild', Resync='resync',
  Execute='execute', Run='run', Start='start', Stop='stop', Restart='restart', Pause='pause', Resume='resume',
  Submit='submit', Process='process', Complete='complete', Retry='retry', Rollback='rollback',
  Link='link', Unlink='unlink', Attach='attach', Detach='detach', Add='add', Remove='remove',
  GetMetadata='getMetadata', GetSchema='getSchema', GetConfiguration='getConfiguration', SetConfiguration='setConfiguration',
  Seed='seed', Migrate='migrate', Backup='backup', RestoreBackup='restoreBackup',
  Ping='ping', Health='health', Status='status', Info='info'
}

export enum ServerResponseTypeEnum {
  Info='info', Success='success', Warning='warning', Error='error', Debug='debug', Critical='critical',
  Validation='validation', Authentication='authentication', Authorization='authorization',
  NotFound='notFound', Conflict='conflict', Timeout='timeout', Maintenance='maintenance',
  Processing='processing', Pending='pending', Partial='partial', Created='created',
  Updated='updated', Deleted='deleted', Restored='restored', Imported='imported', Exported='exported'
}