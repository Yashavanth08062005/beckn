# Quick Reference: 500 Error Fix Guide

## 🚨 If You're Getting 500 Error

### Quick Fix Checklist (2 minutes)

- [ ] Restart BAP service: `cd bap-travel-discovery && npm start`
- [ ] Check ONIX is running: `curl http://localhost:5000/health`
- [ ] Check BAP is running: `curl http://localhost:8080/health`
- [ ] Clear frontend cache: Press `Ctrl+Shift+R` (hard refresh)
- [ ] Check browser console for detailed error message
- [ ] Check `bap-travel-discovery/combined.log` for backend errors

### Most Common Causes

| Issue | Solution |
|-------|----------|
| ONIX not running | Start ONIX: `cd beckn-onix/install && docker-compose up` |
| BAP not running | Start BAP: `cd bap-travel-discovery && npm start` |
| Frontend connecting to wrong URL | Check `VITE_BAP_URL` environment variable |
| Port 5000/8080 in use | Kill: `lsof -i :5000 \| grep LISTEN \| awk '{print $2}' \| xargs kill -9` |
| ONIX endpoint mismatch | Check ONIX config in `beckn-onix/config/travel-discovery.yaml` |

## 🔧 What Was Fixed

1. **Logger Method Mismatch** - Fixed undefined logger methods
2. **Error Propagation** - Error details now reach frontend
3. **Connection Errors** - Better messages for ONIX failures
4. **Input Validation** - Frontend validates before sending
5. **Error Display** - UI shows helpful troubleshooting tips

## 📊 Error Flow (Now Fixed)

```
Frontend Search
    ↓
API Request to /beckn/search
    ↓
BecknController catches request
    ↓
BecknService sends to ONIX
    ↓
[If ONIX fails]
    ↓
Error Handler catches & logs
    ↓
Error message returned to Frontend
    ↓
Frontend displays helpful error with tips
```

## 📝 Logs to Check

**For Backend Errors:**
```bash
tail -50 bap-travel-discovery/combined.log
tail -20 bap-travel-discovery/error.log
```

**For Frontend Errors:**
- Open browser DevTools (F12)
- Go to Console tab
- Search for "API Error" or "Search error"

## 🎯 Expected Behavior After Fix

✅ When all services running:
- No 500 error
- Results displayed or "No results" message
- Detailed logs in console

⚠️ If ONIX down:
- Clear error message: "Cannot connect to ONIX adapter"
- User-friendly troubleshooting tips
- Logs show exactly what failed

## 💡 Pro Tips

1. Use `check-health.sh` to verify services:
   ```bash
   ./check-health.sh
   ```

2. Watch logs while testing:
   ```bash
   # Terminal 1: Watch BAP logs
   tail -f bap-travel-discovery/combined.log
   
   # Terminal 2: Run tests
   # Make search requests
   ```

3. Test directly with curl:
   ```bash
   curl -X POST http://localhost:8080/beckn/search \
     -H "Content-Type: application/json" \
     -d '{"context": {...}}'
   ```

## 🔗 Related Documentation

- Detailed troubleshooting: `TROUBLESHOOTING.md`
- Complete fix explanation: `FIX_SUMMARY.md`
- Health check script: `check-health.sh`
- BAP config: `bap-travel-discovery/src/config/env.js`

---

**Need Help?** See `TROUBLESHOOTING.md` for detailed steps
