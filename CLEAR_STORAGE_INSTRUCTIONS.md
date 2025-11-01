# Clear Storage Instructions

The property data corruption has been fixed, but you need to clear your browser storage to prevent the corrupted data from being reloaded.

## Quick Fix (3 Steps):

### 1. Open Browser Console
- Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- Go to the **Console** tab

### 2. Clear localStorage
Paste this command and press Enter:
```javascript
localStorage.clear(); location.reload();
```

This will:
- Clear all stored data
- Reload the page with fresh data from data.json

### 3. Verify
After the page reloads, check that properties display correctly (names, addresses, units should all be visible).

---

## What Was Fixed:

1. **Frontend Fix**: The app now correctly unwraps backend API responses
   - Before: Saved `{ success: true, data: {...}, message: "..." }` as property
   - After: Extracts and saves only the `data` object

2. **Data.json Reset**: Cleaned all corrupted entries

3. **Future Imports**: CSV/Excel imports will now work correctly because they use the same fixed `addProperty()` function

---

## Alternative Method (Manual):

If the console method doesn't work:

1. Open DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Local Storage** → `http://localhost:3000` (or your domain)
4. Right-click and select **Clear**
5. Refresh the page

## Clear data.json

python -c "import json; data={'properties':[],'tenants':[],'workOrders':[],'transactions':[],'documents':[],'applications':[]}; json.dump(data, open('src/data.json','w'), indent=2); print('Cleared all data from data.json')"

---

## After Clearing:

You can now:
- Import CSV/Excel data (it will save correctly)
- Add properties manually (they will save correctly)
- Use the app normally without data corruption
