import React, { useState } from 'react';
import { Modal, Input, Button } from './ModalComponents';
import { User, Mail, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function RegisterModal() {
  const { showRegister, setShowRegister, setShowLogin, notify } = useApp();
  const [formData, setFormData] = useState({
    name: '', username: '', email: '', password: '', confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      notify('Passwords do not match', 'error');
      return;
    }
    notify('Account created!', 'success');
    setShowRegister(false);
    setShowLogin(true);
  };

  return (
    <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="Create Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} icon={<User />} />
        <Input placeholder="Username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} icon={<User />} />
        <Input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} icon={<Mail />} />
        <Input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} icon={<Shield />} />
        <Input type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} icon={<Shield />} />
        <Button type="submit" className="w-full">Create Account</Button>
      </form>
    </Modal>
  );
}