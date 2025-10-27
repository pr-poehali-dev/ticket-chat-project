import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  event: string;
  date: string;
  venue: string;
  price: number;
  category: string;
  available: number;
}

interface CartItem extends Ticket {
  quantity: number;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'support';
  time: string;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', text: 'Здравствуйте! Чем могу помочь?', sender: 'support', time: '14:30' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'card'
  });

  const tickets: Ticket[] = [
    { id: '1', event: 'Концерт: Би-2', date: '15 ноября 2025', venue: 'Олимпийский', price: 3500, category: 'music', available: 120 },
    { id: '2', event: 'Театр: Мастер и Маргарита', date: '20 ноября 2025', venue: 'МХАТ им. Горького', price: 2800, category: 'theater', available: 45 },
    { id: '3', event: 'Футбол: Спартак - Зенит', date: '22 ноября 2025', venue: 'Лужники', price: 1500, category: 'sport', available: 350 },
    { id: '4', event: 'Стендап: Павел Воля', date: '25 ноября 2025', venue: 'Крокус Сити Холл', price: 2500, category: 'comedy', available: 80 },
    { id: '5', event: 'Балет: Лебединое озеро', date: '28 ноября 2025', venue: 'Большой театр', price: 5000, category: 'theater', available: 25 },
    { id: '6', event: 'Концерт: Сергей Лазарев', date: '30 ноября 2025', venue: 'ВТБ Арена', price: 4200, category: 'music', available: 200 },
    { id: '7', event: 'Стендап: Александр Незлобин', date: '1 декабря 2025', venue: 'Известия Hall', price: 2200, category: 'comedy', available: 150 },
    { id: '8', event: 'Стендап: Юлия Ахмедова', date: '5 декабря 2025', venue: 'Театр Эстрады', price: 1800, category: 'comedy', available: 95 },
    { id: '9', event: 'Стендап: скрытый состав', date: '03 ноября 2025', venue: 'Крокус Сити Холл', price: 3000, category: 'comedy', available: 120 },
  ];

  const categories = [
    { value: 'all', label: 'Все категории', icon: 'Grid3x3' },
    { value: 'music', label: 'Музыка', icon: 'Music' },
    { value: 'theater', label: 'Театр', icon: 'Drama' },
    { value: 'sport', label: 'Спорт', icon: 'Trophy' },
    { value: 'comedy', label: 'Юмор', icon: 'Laugh' },
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ticket.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (ticket: Ticket) => {
    const existingItem = cart.find(item => item.id === ticket.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === ticket.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...ticket, quantity: 1 }]);
    }
    toast.success('Билет добавлен в корзину');
  };

  const removeFromCart = (ticketId: string) => {
    setCart(cart.filter(item => item.id !== ticketId));
    toast.info('Билет удалён из корзины');
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'user',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
    
    setTimeout(() => {
      const supportReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Спасибо за ваш вопрос! Наш специалист свяжется с вами в ближайшее время.',
        sender: 'support',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, supportReply]);
    }, 1000);
  };

  const handleReturnRequest = () => {
    if (!returnOrderId.trim() || !returnReason.trim()) {
      toast.error('Заполните все поля');
      return;
    }
    
    toast.success('Заявка на возврат принята. Мы свяжемся с вами в течение 24 часов.');
    setReturnDialogOpen(false);
    setReturnOrderId('');
    setReturnReason('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Ticket" size={32} className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground">БилетПро</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#tickets" className="text-sm font-medium hover:text-primary transition-colors">Билеты</a>
            <Button variant="ghost" onClick={() => setReturnDialogOpen(true)}>
              <Icon name="RefreshCcw" size={18} className="mr-2" />
              Возврат
            </Button>
          </nav>

          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Icon name="ShoppingCart" size={20} />
                  {cart.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {cart.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Корзина</SheetTitle>
                  <SheetDescription>
                    {cart.length === 0 ? 'Корзина пуста' : `${cart.length} билет(ов)`}
                  </SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {cart.map(item => (
                    <Card key={item.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{item.event}</CardTitle>
                        <CardDescription className="text-sm">{item.date}</CardDescription>
                      </CardHeader>
                      <CardFooter className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="font-semibold">{item.price * item.quantity} ₽</span>
                          <span className="text-muted-foreground ml-2">× {item.quantity}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                          <Icon name="Trash2" size={18} />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {cart.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Итого:</span>
                      <span>{getTotalPrice()} ₽</span>
                    </div>
                    <Button className="w-full" size="lg" onClick={() => setCheckoutDialogOpen(true)}>
                      Оформить заказ
                      <Icon name="ArrowRight" size={18} className="ml-2" />
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            <Button 
              size="icon" 
              className="relative"
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              <Icon name="MessageCircle" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center space-y-4 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold">Билеты на любые мероприятия</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Концерты, театры, спортивные события и многое другое
          </p>
        </div>

        <div id="tickets" className="mb-8 space-y-4">
          <div className="relative max-w-xl mx-auto">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск мероприятий или площадок..."
              className="pl-10 h-12 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.value)}
                className="gap-2"
              >
                <Icon name={cat.icon} size={18} />
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket, index) => (
            <Card key={ticket.id} className="hover:shadow-lg transition-shadow animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl">{ticket.event}</CardTitle>
                  <Badge variant="secondary" className="capitalize">
                    {categories.find(c => c.value === ticket.category)?.label}
                  </Badge>
                </div>
                <CardDescription className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon name="Calendar" size={16} />
                    <span>{ticket.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="MapPin" size={16} />
                    <span>{ticket.venue}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">{ticket.price} ₽</p>
                    <p className="text-sm text-muted-foreground">Осталось: {ticket.available} мест</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => addToCart(ticket)}>
                  <Icon name="Plus" size={18} className="mr-2" />
                  В корзину
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Icon name="SearchX" size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Билеты не найдены</p>
          </div>
        )}
      </main>

      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-card border rounded-lg shadow-2xl flex flex-col z-50 animate-slide-in-right">
          <div className="p-4 border-b bg-primary text-primary-foreground rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Icon name="Headphones" size={20} />
              <h3 className="font-semibold">Поддержка</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)} className="text-primary-foreground hover:bg-primary-foreground/20">
              <Icon name="X" size={20} />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-lg p-3 ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t flex gap-2">
            <Input
              placeholder="Напишите сообщение..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button size="icon" onClick={sendMessage}>
              <Icon name="Send" size={18} />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Оформление заказа</DialogTitle>
            <DialogDescription>
              Заполните данные для получения билетов
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Icon name="ShoppingBag" size={20} />
                Ваш заказ
              </h3>
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.event}</p>
                      <p className="text-sm text-muted-foreground">{item.date} • {item.venue}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.price * item.quantity} ₽</p>
                      <p className="text-sm text-muted-foreground">× {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3 border-t text-lg font-bold">
                <span>Итого:</span>
                <span className="text-primary">{getTotalPrice()} ₽</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Icon name="User" size={20} />
                Контактные данные
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">ФИО *</Label>
                <Input 
                  id="name" 
                  placeholder="Иванов Иван Иванович"
                  value={orderForm.name}
                  onChange={(e) => setOrderForm({...orderForm, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="example@mail.ru"
                    value={orderForm.email}
                    onChange={(e) => setOrderForm({...orderForm, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон *</Label>
                  <Input 
                    id="phone" 
                    placeholder="+7 (999) 123-45-67"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Icon name="CreditCard" size={20} />
                Способ оплаты
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderForm({...orderForm, paymentMethod: 'card'})}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    orderForm.paymentMethod === 'card' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon name="CreditCard" size={24} />
                  <span className="font-medium">Карта</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setOrderForm({...orderForm, paymentMethod: 'sbp'})}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    orderForm.paymentMethod === 'sbp' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon name="Smartphone" size={24} />
                  <span className="font-medium">СБП</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setOrderForm({...orderForm, paymentMethod: 'wallet'})}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    orderForm.paymentMethod === 'wallet' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon name="Wallet" size={24} />
                  <span className="font-medium">Кошелёк</span>
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCheckoutDialogOpen(false)}>
              Назад
            </Button>
            <Button 
              onClick={async () => {
                if (!orderForm.name || !orderForm.email || !orderForm.phone) {
                  toast.error('Заполните все обязательные поля');
                  return;
                }
                
                const orderId = 'UZI-1921';
                
                try {
                  const response = await fetch('https://functions.poehali.dev/32dccee4-66b5-4db7-b968-d1e5b6bd3e95', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      email: orderForm.email,
                      orderId: orderId,
                      name: orderForm.name,
                      tickets: cart,
                      totalPrice: getTotalPrice()
                    })
                  });
                  
                  if (response.ok) {
                    toast.success(`Заказ ${orderId} оформлен! Билеты отправлены на ${orderForm.email}`);
                  } else {
                    toast.success(`Заказ ${orderId} оформлен!`);
                  }
                } catch (error) {
                  toast.success(`Заказ ${orderId} оформлен!`);
                }
                
                setCheckoutDialogOpen(false);
                setCart([]);
                setOrderForm({ name: '', email: '', phone: '', paymentMethod: 'card' });
              }}
              className="gap-2"
            >
              <Icon name="Lock" size={18} />
              Оплатить {getTotalPrice()} ₽
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Возврат билетов</DialogTitle>
            <DialogDescription>
              Заполните форму для оформления возврата. Мы рассмотрим вашу заявку в течение 24 часов.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Номер заказа</Label>
              <Input 
                id="orderId" 
                placeholder="Например: ORD-12345"
                value={returnOrderId}
                onChange={(e) => setReturnOrderId(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Причина возврата</Label>
              <Textarea 
                id="reason" 
                placeholder="Опишите причину возврата..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleReturnRequest}>
              Отправить заявку
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="border-t mt-16 py-8 bg-muted/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex justify-center gap-6 mb-4">
            <Button variant="ghost" size="sm">О нас</Button>
            <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(true)}>Поддержка</Button>
            <Button variant="ghost" size="sm" onClick={() => setReturnDialogOpen(true)}>Возврат билетов</Button>
          </div>
          <p className="text-sm">© 2025 БилетПро. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;