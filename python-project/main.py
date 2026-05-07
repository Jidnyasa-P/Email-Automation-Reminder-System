import pandas as pd
import smtplib
import schedule
import time
import os
import logging
from datetime import datetime
from email.message import EmailMessage
from dotenv import load_dotenv

# 1. SETUP LOGGING
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("logs/automation.log"),
        logging.StreamHandler()
    ]
)

# 2. LOAD ENVIRONMENT VARIABLES
load_dotenv()
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
DRY_RUN = os.getenv("DRY_RUN", "True").lower() == "true"

def load_data():
    """Load contacts and reminders from CSV files."""
    try:
        contacts = pd.read_csv("data/contacts.csv")
        reminders = pd.read_csv("data/reminders.csv")
        # Merge reminders with contacts based on email
        merged_data = pd.merge(reminders, contacts, on="email", how="left")
        return merged_data
    except Exception as e:
        logging.error(f"Error loading data: {e}")
        return None

def generate_email_content(template_path, data_row):
    """Personalize the HTML template with data from CRM."""
    with open(template_path, 'r') as file:
        template = file.read()
    
    # Replace placeholders
    content = template.replace("{{name}}", str(data_row['name']))
    content = content.replace("{{company}}", str(data_row['company']))
    content = content.replace("{{reminder_type}}", str(data_row['reminder_type']))
    content = content.replace("{{task_name}}", str(data_row['task_name']))
    content = content.replace("{{due_date}}", str(data_row['due_date']))
    
    return content

def send_email(to_email, subject, body):
    """Send the email using SMTP."""
    if DRY_RUN:
        logging.info(f"[DRY RUN] Would send email to {to_email} with subject: {subject}")
        return True

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = to_email
    msg.set_content("Please enable HTML to view this message.")
    msg.add_alternative(body, subtype='html')

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)
        return True
    except Exception as e:
        logging.error(f"Failed to send to {to_email}: {e}")
        return False

def job():
    """Main task to process reminders."""
    logging.info("Starting scheduled email automation task...")
    data = load_data()
    if data is None: return

    report_list = []
    
    for index, row in data.iterrows():
        subject = f"Urgent: {row['reminder_type']} Reminder - {row['task_name']}"
        body = generate_email_content("templates/email_template.html", row)
        
        success = send_email(row['email'], subject, body)
        
        report_list.append({
            "email": row['email'],
            "status": "Sent" if success else "Failed",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })

    # Save report
    report_df = pd.DataFrame(report_list)
    report_filename = f"outputs/report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    report_df.to_csv(report_filename, index=False)
    logging.info(f"Automation task complete. Report saved: {report_filename}")

def main():
    print("--- Email Automation & Reminder System ---")
    print(f"Mode: {'DRY RUN' if DRY_RUN else 'PRODUCTION'}")
    
    # Run once immediately for testing
    job()
    
    # Schedule for future (e.g., every day at 09:00)
    # schedule.every().day.at("09:00").do(job)
    
    # For simulation, we'll just run every 1 minute
    schedule.every(1).minutes.do(job)
    
    print("System active. Press Ctrl+C to stop.")
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    # Create necessary directories
    for folder in ['logs', 'outputs']:
        if not os.path.exists(folder):
            os.makedirs(folder)
    main()
