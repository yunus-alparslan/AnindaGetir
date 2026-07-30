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
  Home,
  Instagram,
  ListChecks,
  MapPin,
  Menu,
  MessageCircle,
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

const editableContent = initializeEditableContent();

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
    Home,
    Instagram,
    ListChecks,
    MapPin,
    Menu,
    MessageCircle,
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
  const toast = document.getElementById('toast');
  toast?.classList.add('show');
  this.reset();
  window.setTimeout(() => toast?.classList.remove('show'), 4000);
});

if (window.location.pathname.replace(/\/+$/, '') === '/admin') {
  import('./admin.js').then(({ initializeAdmin }) => initializeAdmin(editableContent));
}
