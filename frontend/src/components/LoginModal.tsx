import React, { useState } from 'react';
import { Modal, Input, Button } from './ModalComponents';
import { User, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginModal() {
  const { showLogin, setShowLogin, login, notify } = useApp();
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ name: formData.username, username: formData.username });
    notify('Login successful!', 'success');
    setShowLogin(false);
  };

  return (
    <Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Login">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Username"
          value={formData.username}
          onChange={e => setFormData({ ...formData, username: e.target.value })}
          icon={<User />}
        />
        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
          icon={<Shield />}
        />
        <Button type="submit" className="w-full">Login</Button>
      </form>
    </Modal>
  );
}