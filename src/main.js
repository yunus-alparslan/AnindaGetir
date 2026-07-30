import './style.css';
import { initializeEditableContent } from './content-store.js';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Box,
  Building2,
  CheckCircle,
  Clock,
  createIcons,
  Facebook,
  Forklift,
  Home,
  Instagram,
  ListChecks,
  MapPin,
  Menu,
  MessageCircle,
  MoveVertical,
  Package,
  Phone,
  PhoneCall,
  Send,
  ShieldCheck,
  Star,
  Truck,
  Users,
  Warehouse
} from 'lucide';

async function initializeSite() {
const editableContent = await initializeEditableContent();

createIcons({
  icons: {
    ArrowRight,
    Award,
    BadgeCheck,
    Box,
    Building2,
    CheckCircle,
    Clock,
    Facebook,
    Forklift,
    Home,
    Instagram,
    ListChecks,
    MapPin,
    Menu,
    MessageCircle,
    MoveVertical,
    Package,
    Phone,
    PhoneCall,
    Send,
    ShieldCheck,
    Star,
    Truck,
    Users,
    Warehouse
  }
});

window.addEventListener('load', () => {
  const splash = document.getElementById('splash-screen');

  window.setTimeout(() => {
    splash?.classList.add('is-hidden');
    document.body.classList.remove('splash-active');
    window.setTimeout(() => splash?.remove(), 600);
  }, 1500);
});

const mobileMenuButton = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton?.addEventListener('click', () => mobileMenu?.classList.toggle('hidden'));
mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
});

window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  navbar?.classList.toggle('shadow-md', window.scrollY > 50);
});

document.getElementById('contactForm')?.addEventListener('submit', function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(this);
  const getValue = (field) => String(formData.get(field) || '').trim();
  const lines = [
    'Merhaba, ücretsiz fiyat teklifi almak istiyorum.',
    '',
    `Ad Soyad: ${getValue('name')}`,
    `Telefon: ${getValue('phone')}`,
    `Hizmet Türü: ${getValue('service')}`,
    `Nereden: ${getValue('from') || 'Belirtilmedi'}`,
    `Nereye: ${getValue('to') || 'Belirtilmedi'}`,
    `Detaylar: ${getValue('message') || 'Belirtilmedi'}`
  ];

  const whatsappUrl = `https://wa.me/905338806106?text=${encodeURIComponent(lines.join('\n'))}`;
  window.location.href = whatsappUrl;
});

const isAdminPage =
  window.location.pathname.replace(/\/+$/, '') === '/admin' ||
  new URLSearchParams(window.location.search).get('admin') === '1';

if (isAdminPage) {
  import('./admin.js').then(({ initializeAdmin }) => initializeAdmin(editableContent));
}
}

initializeSite();
