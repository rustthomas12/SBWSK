# 📍 WHERE TO INSTALL PHP (Not in VS Code!)

## ✅ Premium Logo Updated to $10!

---

## 🖥️ WHERE TO RUN THE COMMANDS:

### You're using **WSL (Windows Subsystem for Linux)**

**Do NOT install in VS Code!** Install in your **WSL Terminal**.

---

## 🎯 STEP-BY-STEP:

### Option 1: Use VS Code's Built-in Terminal (EASIEST)

1. **In VS Code**, press `` Ctrl + ` `` (backtick key)
   - Or go to: **Terminal → New Terminal**

2. You should see a terminal at the bottom that says something like:
   ```
   rustt@DESKTOP-XXX:/home/rustt/projects/New_Website/SBWSK$
   ```

3. **Copy and paste this command:**
   ```bash
   sudo apt-get update && sudo apt-get install -y php php-cli php-curl php-mbstring php-xml php-zip unzip curl
   ```

4. Press **Enter**

5. It will ask for your **Windows password** (the one you use to log into Windows)

6. Type it and press Enter (you won't see the password as you type - that's normal!)

7. Wait for it to finish (30 seconds)

8. Then run this:
   ```bash
   cd /home/rustt/projects/New_Website/SBWSK && curl -sS https://getcomposer.org/installer | php && php composer.phar require stripe/stripe-php
   ```

9. **Done!** ✅

---

### Option 2: Use Ubuntu/WSL App

1. Open **Start Menu**

2. Search for "**Ubuntu**" or "**WSL**"

3. Click to open it

4. You'll see a black terminal window

5. Paste the same commands above

---

## 🎬 VISUAL GUIDE:

```
┌─────────────────────────────────┐
│  VS Code Window                 │
│  ┌───────────────────────────┐  │
│  │ Your files (templates.html)│  │
│  └───────────────────────────┘  │
│                                 │
│  Press Ctrl + ` HERE ↓          │
│  ┌───────────────────────────┐  │
│  │ TERMINAL (paste commands) │  │ ← USE THIS!
│  │ rustt@DESKTOP:~/projects$ │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

## ✅ WHAT THE COMMANDS DO:

### Command 1:
Installs PHP and everything you need on your computer

### Command 2:
Downloads the Stripe library so payments can work

---

## ⚠️ IMPORTANT:

- **Don't** install PHP as a VS Code extension
- **Don't** download PHP manually
- **Just** paste the commands in the terminal
- **That's it!**

---

## 🧪 HOW TO KNOW IT WORKED:

After running both commands, type this:
```bash
php -v
```

You should see something like:
```
PHP 8.1.2 (cli)
```

If you see that, **YOU'RE DONE!** 🎉

---

## 📞 STILL CONFUSED?

1. Open VS Code
2. Press `` Ctrl + ` ``
3. Paste the first command
4. Enter your password
5. Wait
6. Paste the second command
7. Done!

**That's literally it!**
