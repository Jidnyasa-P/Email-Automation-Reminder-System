# Email Automation & Reminder System 🚀

A Python-based enterprise automation tool designed to handle high-frequency communication reminders using CSV data and SMTP protocols. Optimized for HR, Sales, and Operations workflows.

## 📌 Project Overview
This system automates the repetitive task of sending follow-up emails and reminders. It reads recipient data from a contact list, merges it with scheduled tasks (payments, meetings, etc.), and generates personalized HTML emails sent via secure SMTP.

### Key Problem Solved
Manual follow-up is prone to human error and delays. This project ensures 100% consistency in communication, reducing missed deadlines and improving workflow efficiency.

## 🛠 Tech Stack
- **Core:** Python 3.x
- **Data Handling:** Pandas (CSV parsing and merging)
- **Email Engine:** smtplib (SMTP with TLS/SSL), email.message
- **Task Scheduling:** `schedule` library
- **Environment Management:** python-dotenv
- **Logging:** Native Python logging for audit trails

## 📂 Project Structure
```text
Email-Automation-System/
├── data/               # CSV files (contacts, reminders)
├── templates/          # HTML email templates
├── src/                # Modular source code
├── logs/               # Execution logs (audit trail)
├── outputs/            # Generated PDF/CSV reports
├── requirements.txt    # Library dependencies
├── .env.example        # Configuration blueprint
└── main.py             # Entry point
```

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.8+ installed
- A Gmail account (using App Password)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/email-automation.git
cd email-automation

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration
1. Copy `.env.example` to `.env`
2. Update `EMAIL_ADDRESS` and `EMAIL_PASSWORD` (Use Google App Password)
3. Set `DRY_RUN=True` for safety during initial tests.

### 4. Running the System
```bash
python main.py
```

