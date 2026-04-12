import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
from dotenv import load_dotenv

# Configure logging to show in console
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app.services.email_service")

class EmailService:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587

    def _get_credentials(self):
        # Reload .env file to catch changes without server restart
        load_dotenv(override=True)
        user = os.getenv("EMAIL_USER")
        password = os.getenv("EMAIL_PASS")
        return user, password

    def _send_email(self, to_email: str, subject: str, body: str):
        email_user, email_pass = self._get_credentials()

        if not email_user or not email_pass:
            logger.error("❌ SMTP ERROR: EMAIL_USER or EMAIL_PASS not set in .env")
            return False

        # Mask password for safe logging
        masked_pass = email_pass[:2] + "*" * (len(email_pass) - 4) + email_pass[-2:] if len(email_pass) > 4 else "****"
        logger.info(f"📧 Attempting to send email to: {to_email}")
        logger.info(f"🔑 Using User: {email_user} and Pass: {masked_pass}")

        try:
            msg = MIMEMultipart()
            msg['From'] = email_user
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'html'))

            logger.info(f"🚀 Connecting to {self.smtp_server}:{self.smtp_port}...")
            server = smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=10)
            
            logger.info("🔐 Starting TLS...")
            server.starttls()
            
            logger.info(f"👤 Logging in as {email_user}...")
            server.login(email_user, email_pass)
            
            logger.info("📤 Sending message...")
            server.sendmail(email_user, to_email, msg.as_string())
            
            server.quit()
            logger.info(f"✅ SUCCESS: Email sent to {to_email}")
            return True

        except smtplib.SMTPAuthenticationError:
            logger.error("❌ SMTP AUTH ERROR: Authentication failed. Please check if you're using a Google APP PASSWORD (not your normal password).")
            return False
        except smtplib.SMTPConnectError:
            logger.error("❌ SMTP CONNECT ERROR: Could not connect to the SMTP server.")
            return False
        except Exception as e:
            logger.error(f"❌ SMTP UNEXPECTED ERROR: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return False

    def send_verification_email(self, email: str, token: str):
        subject = "Verify Your Email"
        verify_url = f"http://localhost:8000/auth/verify-email?token={token}"
        body = f"""
        <html>
            <body>
                <h2>Welcome to Smart Teacher Robot!</h2>
                <p>Please verify your email by clicking the link below:</p>
                <a href="{verify_url}">Verify Email</a>
            </body>
        </html>
        """
        return self._send_email(email, subject, body)

    def send_reset_password_email(self, email: str, token: str):
        subject = "Reset Your Password"
        reset_url = f"http://localhost:8000/auth/reset-password?token={token}"
        body = f"""
        <html>
            <body>
                <h2>Reset Your Password</h2>
                <p>Click the link below to set a new password:</p>
                <a href="{reset_url}">Reset Password</a>
                <p>This link will expire in 15-30 minutes.</p>
            </body>
        </html>
        """
        return self._send_email(email, subject, body)

email_service = EmailService()
