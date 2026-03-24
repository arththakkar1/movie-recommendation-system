# 🚀 mrs Project Setup Guide

Welcome! This guide will walk you through setting up and running your Django project created using **django-structurator**.

---

## 📦 1. Set Up Virtual Environment

### 🐧 Linux / macOS:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 🪟 Windows (CMD):
```cmd
python -m venv venv
venv\Scripts\activate
```

### ⚠️ If Activation Fails in Windows:
You may see an error like:

```
execution of scripts is disabled on this system
```

**Solution: Run PowerShell as Administrator and execute:**
```powershell
Set-ExecutionPolicy RemoteSigned
```

---

## 📥 2. Install Requirements

```bash
pip install -r requirements/development.txt
```

If using production:
```bash
pip install -r requirements/production.txt
```

---

## 🔐 3. Configure Environment Variables

Copy the example file and fill in the required values:
```bash
cp .env.example .env
```

Open `.env` and configure:
- `SECRET_KEY`
- `ALLOWED_HOSTS`

- `SMTP_CONFI`

You can generate a secret key using:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---



## 🗄️ 4. Apply Migrations & Setup Database

```bash
python src/manage.py migrate
```

---

## 👤 5. Create a Superuser

```bash
python src/manage.py createsuperuser
```

---

## 🚀 6. Run the Development Server

```bash
python src/manage.py runserver
```

---



## ✅ You’re All Set!

Your project is now ready for development 🚀
