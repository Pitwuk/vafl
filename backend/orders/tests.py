from django.test import TestCase
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from decouple import config
import ssl
import smtplib
# email test
try:
    msg = MIMEMultipart("alternative")
    msg['Subject'] = 'VAFL PCB Order Success'
    msg['From'] = 'vaflpcb@gmail.com'
    msg['To'] = 'plogden2@gmail.com'

    with open('./orders/emailTemplatePlain.txt') as template:
        plain = MIMEText(template.read(), "plain")
    with open('./orders/emailTemplate.html') as template:
        fancy = MIMEText(template.read(), "html")
    msg.attach(plain)
    msg.attach(fancy)

    port = 465
    password = config('EMAIL_PASSWORD')

    context = ssl.create_default_context()

    with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
        server.login(msg['From'], password)
        server.sendmail(msg['From'], msg['To'], msg.as_string())
        server.quit()
    print('email sent')
except Exception as e:
    print(e)
    print('error sending email')
