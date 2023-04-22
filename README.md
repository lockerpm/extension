# locker-extension

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
Start tailwindcss
```
npm run style
```
Start dev server
```
npm run dev
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


# How to get new refresh token
## Using any web browser to retrieve the code, replace the $CLIENT_ID with the env var in CI/CD vars:
```
https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=$CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob
```
## After signing with proper Locker account, continue to get the code, then curl for the refresh token, replace any needed env vars with CI/CD vars:
```
curl "https://accounts.google.com/o/oauth2/token" -d "client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&code=$CODE&grant_type=authorization_code&redirect_uri=urn:ietf:wg:oauth:2.0:oob"
```
## The reponse comes in like this:
```
{
  "access_token" : "ya29...",
  "expires_in" : 3600,
  "refresh_token" : "1/rwn...",
  "scope": "https://www.googleapis.com/auth/chromewebstore",
  "token_type" : "Bearer",
}
```
## Replace the old refresh token in CI/CD vars with this new one, run the job again.
