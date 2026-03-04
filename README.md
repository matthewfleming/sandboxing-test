# Readme

A test of browser security

## Setup

1. Setup hosts Add entries to your /etc/hosts (macOS/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows):

```
127.0.0.1 masthead.com
127.0.0.1 pay.masthead.com
127.0.0.1 adtech.com
```

2. Start the server

```
pnpm i
pnpn start
```

3. Visit http://masthead.com

4. View the console logs

## 🔍 What This Setup Demonstrates

1. Same‑Origin Policy
The malicious script from adtech.com will try to access:

```js
iframe.contentWindow.document
```

The browser will block this because:

- adtech.com
- pay.masthead.com

…are different origins.

You’ll see an error like:

```
DOMException: Blocked a frame from accessing a cross‑origin frame.
```

2. Iframe Isolation
Even though the iframe is embedded on masthead.com, the script from adtech.com cannot reach into it.

3. Cross‑domain script execution
The script runs, but cannot break SOP.

4. Benign script loads and runs
It can send messages to the iframe but cannot read its DOM.

5. iframe responds via postMessage
The credit‑card form sends data back only after verifying the origin.

6. Same‑Origin Policy remains intact
Even the benign script cannot directly access:

```js
iframe.contentWindow.document
```

It will throw a DOMException.

## How

This was the initial prompt:

I want to create a simple express app for testing web browser security and sandboxing. a single app will host multiple domains. pay.masthead.com will host a credit card form. adtech.com will host a malicious script that is trying to obtain the details in the credit card form. masthead.com will return a webpage containing an iframe with the creditcard form and including the javascript from adtech.com.