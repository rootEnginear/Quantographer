type StoreType = {
  initExecuteDialog?: (..._: any[]) => any
  initExportDialog?: (..._: any[]) => any
  initNewGateDialog?: (..._: any[]) => any
  newGateDialogInstance?: any
}

export const Store: StoreType = {
  initExecuteDialog: undefined,
  initExportDialog: undefined,
  initNewGateDialog: undefined,
  newGateDialogInstance: undefined
}
