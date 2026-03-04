const express = require("express");
const vhost = require("vhost");

const app = express();

// --- pay.masthead.com ---
const payApp = express();
payApp.get('/', (req, res) => {
  res.send(`
    <h1>Credit Card Form</h1>
    <form id="cc-form">
      <input name="cc-number" placeholder="Card Number"><br>
      <input name="cc-cvc" placeholder="CVC"><br>
      <button>Submit</button>
    </form>

    <script>
      window.addEventListener("message", (event) => {
        if (event.origin !== "http://masthead.com") return;

        if (event.data.type === "REQUEST_CC_DATA") {
          const form = document.getElementById("cc-form");
          const data = {
            number: form["cc-number"].value,
            cvc: form["cc-cvc"].value
          };

          event.source.postMessage({ type: "CC_DATA", data }, event.origin);
        }
      });
    </script>
  `);
});

// --- adtech.com ---
const adtechApp = express();
adtechApp.get("/steal.js", (req, res) => {
  res.type("application/javascript");
  res.send(`
    console.log("Malicious script loaded from adtech.com");

    try {
      const iframe = document.querySelector("iframe");
      const form = iframe.contentWindow.document.querySelector("#cc-form");
      console.log("Form inside iframe:", form);
    } catch (e) {
      console.log("Blocked by browser security:", e);
    }
  `);
});

// --- masthead.com ---
const mainApp = express();
mainApp.get('/', (req, res) => {
  res.send(`
    <h1>Masthead Container Page</h1>

    <iframe id="cc-frame" src="http://pay.masthead.com" width="400" height="200"></iframe>

    <script src="/benign.js"></script>

    <script src="http://adtech.com/steal.js"></script>
  `);
});


mainApp.get("/csp", (req, res) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; frame-src http://pay.masthead.com; script-src 'self'",
  );

  res.send(`
    <h1>Masthead Container Page</h1>

    <iframe id="cc-frame" src="http://pay.masthead.com" width="400" height="200"></iframe>

    <script src="/benign.js"></script>

    <!-- This will now be BLOCKED by CSP -->
    <script src="http://adtech.com/steal.js"></script>
  `);
});

mainApp.get("/benign.js", (req, res) => {
  res.send(`
    console.log("Benign script loaded from masthead.com");

    window.addEventListener("message", (event) => {
      console.log("Message received from iframe:", event.data);
    });

    function requestCardData() {
      const iframe = document.getElementById("cc-frame");
      iframe.contentWindow.postMessage({ type: "REQUEST_CC_DATA" }, "http://pay.masthead.com");
    }

    setTimeout(requestCardData, 2000);
  `);
});

// Register virtual hosts
app.use(vhost("pay.masthead.com", payApp));
app.use(vhost("adtech.com", adtechApp));
app.use(vhost("masthead.com", mainApp));

app.listen(80, () => {
  console.log("Server running on port 80");
});
