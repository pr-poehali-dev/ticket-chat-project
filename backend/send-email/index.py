import json
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Send email with order confirmation and ticket details
    Args: event with httpMethod, body containing recipient email, order details
          context with request_id
    Returns: HTTP response with success/error status
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    recipient_email = body_data.get('email')
    order_id = body_data.get('orderId')
    customer_name = body_data.get('name')
    tickets = body_data.get('tickets', [])
    total_price = body_data.get('totalPrice')
    
    if not recipient_email or not order_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email and orderId are required'})
        }
    
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if not all([smtp_host, smtp_port, smtp_user, smtp_password]):
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'SMTP settings not configured'})
        }
    
    message = MIMEMultipart('alternative')
    message['Subject'] = f'Ваши билеты - Заказ {order_id}'
    message['From'] = smtp_user
    message['To'] = recipient_email
    
    tickets_html = ''
    for ticket in tickets:
        tickets_html += f'''
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">{ticket.get('event')}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">{ticket.get('date')}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">{ticket.get('venue')}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">{ticket.get('quantity')} шт.</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">{ticket.get('price') * ticket.get('quantity')} ₽</td>
        </tr>
        '''
    
    html_content = f'''
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4F46E5;">Спасибо за заказ!</h1>
            <p>Здравствуйте, {customer_name}!</p>
            <p>Ваш заказ <strong>{order_id}</strong> успешно оформлен и оплачен.</p>
            
            <h2 style="color: #4F46E5; margin-top: 30px;">Ваши билеты:</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        <th style="padding: 10px; text-align: left;">Мероприятие</th>
                        <th style="padding: 10px; text-align: left;">Дата</th>
                        <th style="padding: 10px; text-align: left;">Место</th>
                        <th style="padding: 10px; text-align: right;">Кол-во</th>
                        <th style="padding: 10px; text-align: right;">Сумма</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets_html}
                </tbody>
                <tfoot>
                    <tr style="font-weight: bold; background-color: #f9fafb;">
                        <td colspan="4" style="padding: 15px; text-align: right;">Итого:</td>
                        <td style="padding: 15px; text-align: right; color: #4F46E5; font-size: 18px;">{total_price} ₽</td>
                    </tr>
                </tfoot>
            </table>
            
            <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>📱 Важно:</strong> Сохраните это письмо. Для входа на мероприятие предъявите QR-код или номер заказа.</p>
            </div>
            
            <p>Если у вас возникли вопросы, свяжитесь с нашей поддержкой через чат на сайте.</p>
            
            <p style="color: #6B7280; font-size: 14px; margin-top: 40px;">
                С уважением,<br>
                Команда поддержки
            </p>
        </div>
    </body>
    </html>
    '''
    
    html_part = MIMEText(html_content, 'html')
    message.attach(html_part)
    
    try:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(message)
        server.quit()
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Failed to send email: {str(e)}'})
        }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'success': True, 'message': 'Email sent successfully'})
    }