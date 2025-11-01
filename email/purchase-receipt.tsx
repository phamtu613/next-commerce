import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';
import { formatCurrency } from '@/lib/utils';
import { Order } from '@/types';
import sampleData from '@/prisma/sample-data';

type PurchaseReceiptEmailProps = {
  order: Order;
};

const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });

export default function PurchaseReceiptEmail({ order }: PurchaseReceiptEmailProps) {
  // Tính tổng tiền từ orderItems
  const totalAmount = order.orderItems.reduce(
    (sum, item) => sum + Number(item.price) * (item.qty || 0),
    0
  );

  return (
    <Html>
      <Head />
      <Preview>Order Confirmation #{order.id}</Preview>
      <Body
        style={{
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f9f9f9',
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            margin: '20px auto',
            maxWidth: '600px',
          }}
        >
          {/* Header */}
          <Section>
            <Heading style={{ fontSize: '24px', color: '#333', marginBottom: '10px' }}>
              Thank you for your order!
            </Heading>
            <Text style={{ fontSize: '16px', color: '#555' }}>
              Hi {order.user.name}, we’ve received your order #{order.id} on{' '}
              {dateFormatter.format(new Date(order.createdAt))}.
            </Text>
          </Section>

          {/* Order Summary */}
          <Section style={{ marginTop: '20px' }}>
            <Heading style={{ fontSize: '18px', color: '#333', marginBottom: '10px' }}>
              Order Summary
            </Heading>
            {order.orderItems.map((item) => (
              <Row key={item.productId} style={{ marginBottom: '8px' }}>
                <Column style={{ width: '70%' }}>
                  {item.name} x {item.qty}
                </Column>
                <Column style={{ width: '30%', textAlign: 'right' }}>
                  {formatCurrency(Number(item.price) * (item.qty || 0))}
                </Column>
              </Row>
            ))}
            {/* Total */}
            <Row
              style={{
                borderTop: '1px solid #ddd',
                marginTop: '10px',
                paddingTop: '10px',
              }}
            >
              <Column style={{ fontWeight: 'bold', width: '70%' }}>Total</Column>
              <Column
                style={{
                  fontWeight: 'bold',
                  width: '30%',
                  textAlign: 'right',
                }}
              >
                {formatCurrency(totalAmount)}
              </Column>
            </Row>
          </Section>

          {/* Footer */}
          <Section style={{ marginTop: '20px' }}>
            <Text style={{ fontSize: '14px', color: '#888' }}>
              If you have any questions, reply to this email or contact our support.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
PurchaseReceiptEmail.PreviewProps = {
  order: {
    id: crypto.randomUUID(),
    user: { name: 'Thanh Tuấn', email: 'lynguyenthanhtuan@gmail.com' },
    createdAt: new Date(),
    orderItems: [
      {
        id: crypto.randomUUID(),
        name: 'Yamaha F310',
        quantity: 1,
        price: 299.99,
        image: 'https://salempiano.vn/wp-content/uploads/2020/02/salem11.jpg',
        orderId: '123',
      },
      {
        id: crypto.randomUUID(),
        name: 'Fender Stratocaster',
        quantity: 2,
        price: 899.99,
        image: 'https://salempiano.vn/wp-content/uploads/2020/02/salem12.jpg',
        orderId: '123',
      },
    ],
    isDelivered: true,
    deliveredAt: new Date(),
    isPaid: true,
    paidAt: new Date(),
    paymentResult: {
      id: '123',
      status: 'succeeded',
      pricePaid: 299.99 + 2 * 899.99,
      email_address: 'lynguyenthanhtuan@gmail.com',
    },
  },
};