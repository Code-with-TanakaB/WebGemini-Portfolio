# How to Delete Old Clients from Admin Dashboard

## Why Delete Old Clients?

Old clients in the database were created with the old pricing (R4,000 for Enterprise).
They will continue to show the old price because that's what was stored in the database.

**New clients** created after the price update will automatically use the new R4,999 price.

## Steps to Delete Clients:

1. **Login to Admin Dashboard**
   - Go to your admin dashboard
   - Navigate to the "Clients" section

2. **Locate the Client**
   - Find the client with the old price (R4,000)
   - Look for the red trash icon in the "Actions" column

3. **Delete the Client**
   - Click the red trash/delete button
   - Confirm the deletion (you'll get 2 confirmation prompts)
   - The client and all associated data will be permanently deleted

4. **Test New Signup**
   - Go to client signup page
   - Create a new test client with Enterprise plan
   - It will now show R4,999 and calculate 20% commission = R999.80

## Alternative: Bulk Delete via Database

If you need to delete all test clients at once, you can use the backend API or database directly.

## After Deletion

Once old clients are deleted:
- ✅ New Enterprise signups will use R4,999
- ✅ Commission will be R999.80 (20%)
- ✅ All dashboards will show correct prices
