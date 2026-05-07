import { useState } from 'react'
import { useTranslation } from 'react-i18next';
import GlassModal from '../ui/GlassModal';

export const InputModal = ({ addTask, role, users, open, onClose }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [description, setDes] = useState('');
    const [assigned, setAssigned] = useState(null);
    const [deadline, setDeadline] = useState(null);

    const handleCreate = () => {
        addTask(title, description, role, assigned, deadline);
        setTitle('');
        setDes('');
        setAssigned(null);
        setDeadline(null);
        onClose();
    };

    return (
        <GlassModal
            open={open}
            onClose={onClose}
            title={t('addCard')}
            footer={
                <button className="glass-btn-primary px-6 py-2.5" onClick={handleCreate}>
                    {t('create')}
                </button>
            }
        >
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="mb-4">
                    <label className="text-white/70 text-sm font-medium block mb-1.5">{t('taskTitle')}</label>
                    <input
                        type="text"
                        className="glass-input"
                        placeholder={t('taskTitle')}
                        value={title}
                        onChange={(event) => { setTitle(event.target.value) }}
                    />
                </div>
                <div className="mb-4">
                    <label className="text-white/70 text-sm font-medium block mb-1.5">{t('taskDescription')}</label>
                    <textarea
                        className="glass-textarea"
                        rows="3"
                        placeholder={t('taskDescription')}
                        value={description}
                        onChange={(event) => { setDes(event.target.value) }}
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="text-white/70 text-sm font-medium block mb-1.5">{t('deadline')}</label>
                    <input
                        type="date"
                        className="glass-input"
                        value={deadline || ''}
                        onChange={(event) => { setDeadline(event.target.value) }}
                    />
                </div>
                <div className="mb-4">
                    <label className="text-white/70 text-sm font-medium block mb-1.5">{t('selectAssignee')}</label>
                    <select
                        value={assigned || ''}
                        className="glass-select"
                        onChange={(event) => { setAssigned(event.target.value) }}
                    >
                        <option value="">{t('unassigned')}</option>
                        {users.map(user => <option key={user.id} value={user.id}>{user.fullName}</option>)}
                    </select>
                </div>
            </form>
        </GlassModal>
    )
}
