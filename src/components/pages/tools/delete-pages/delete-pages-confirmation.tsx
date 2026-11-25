export function DeletePagesConfirmation({ deletedCount, remainingCount, onCancel, onConfirm, isProcessing }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
        <h3 className="text-xl font-bold text-red-600 mb-2">Confirm Deletion</h3>
        <p className="text-sm text-muted-foreground mb-4">
          You're about to remove {deletedCount} pages. Your new PDF will contain {remainingCount} pages. Your original file will remain unchanged.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} disabled={isProcessing} className="px-4 py-2 text-sm border rounded hover:bg-accent disabled:opacity-50">Cancel</button>
          <button onClick={onConfirm} disabled={isProcessing} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
            {isProcessing ? 'Deleting...' : 'Delete Pages'}
          </button>
        </div>
      </div>
    </div>
  );
}