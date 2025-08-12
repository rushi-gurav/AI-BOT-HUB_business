# 🔧 Complete Troubleshooting Guide

## 🚨 Current Issue: Model Error

**Error:** `404 No endpoints found for qwen/qwen3-235b-a22b-2507:free`

### Quick Fix Options:

#### Option 1: Use the Fix Script (Recommended)
```bash
cd DocuChat
node fix_model.js
```

#### Option 2: Manual Database Fix
1. Connect to your database
2. Run this SQL:
```sql
UPDATE bots 
SET model_name = 'anthropic/claude-3-haiku', 
    api_provider = 'openrouter'
WHERE model_name = 'qwen/qwen3-235b-a22b-2507:free';
```

#### Option 3: Use the Edit Bot Feature
1. Go to `/bots` page
2. Click the edit button (pencil icon)
3. Change model to `anthropic/claude-3-haiku`
4. Keep OpenRouter as provider
5. Click "Update Bot"

### 🔍 Debug Steps:

1. **Check Current Bot Configuration:**
   - Look at the debug info in chat header
   - Should show: `openrouter | anthropic/claude-3-haiku`

2. **Refresh Bot Data:**
   - Click the refresh button in chat header
   - Check if model name updates

3. **Clear Browser Cache:**
   - Hard refresh (Ctrl+F5)
   - Clear browser cache

4. **Restart Server:**
   ```bash
   npm run dev
   ```

## ✅ Valid Model Configurations

### OpenRouter (Recommended)
- **Model:** `anthropic/claude-3-haiku`
- **Provider:** `openrouter`
- **Cost:** Very cheap, fast

### OpenAI
- **Model:** `gpt-4o`
- **Provider:** `openai`
- **Cost:** Moderate

### Alternative OpenRouter Models
- `anthropic/claude-3-sonnet` (better quality)
- `openai/gpt-4o` (if you have credits)
- `openai/gpt-4o-mini` (cheaper)

## 🛠️ Common Issues & Solutions

### Issue 1: Bot Update Not Working
**Symptoms:** PUT request succeeds but chat still fails
**Solution:** 
- Clear browser cache
- Restart server
- Use refresh button in chat

### Issue 2: API Key Problems
**Symptoms:** Authentication errors
**Solution:**
- Check API key validity
- Ensure correct provider selected
- Test API key in provider dashboard

### Issue 3: Model Not Found
**Symptoms:** 404 errors for model
**Solution:**
- Use only validated model names
- Check provider documentation
- Use suggested models from UI

### Issue 4: Caching Issues
**Symptoms:** Old data persists
**Solution:**
- Hard refresh browser
- Clear localStorage
- Restart development server

## 🔄 Complete Reset Process

If nothing else works:

1. **Stop the server**
2. **Clear database:**
   ```sql
   DELETE FROM chat_messages;
   DELETE FROM embeddings;
   DELETE FROM documents;
   DELETE FROM bots;
   ```
3. **Restart server:** `npm run dev`
4. **Create new bot** with valid configuration

## 📞 Support

If you're still having issues:

1. Check the terminal logs for detailed error messages
2. Verify your API keys are valid
3. Ensure you have credits/access to the selected provider
4. Try a different API provider (OpenAI, Gemini, etc.)

## 🎯 Success Indicators

Your bot is working when:
- ✅ Chat loads without errors
- ✅ Debug info shows valid model
- ✅ Messages send successfully
- ✅ Bot responds with document-based answers
- ✅ No 404 or authentication errors in logs

