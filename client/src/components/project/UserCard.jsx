import Avatar from "../ui/Avatar";

const UserCard = ({ user, rating = null, canDelete = false, onDeleteUser = null }) => {
    return (
        <div className="glass-card-subtle hover:bg-white/10 transition-all duration-200 relative">
            {canDelete && (
                <button
                    onClick={() => onDeleteUser && onDeleteUser(user.id)}
                    className="absolute top-2 right-2 p-1 text-white/50 hover:text-white/80 hover:bg-white/15 rounded transition"
                    title="Remove member"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            )}
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <Avatar photo={user.photo} alt={user.fullName} status={user.status} size={40} />
                    <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-base truncate">
                            {user.fullName}
                        </div>
                        <div className="text-white/50 text-sm truncate">
                            {user.email}
                        </div>
                    </div>
                    {rating !== null && (
                        <div className="flex items-center gap-1 text-orange-400">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span className="text-sm font-medium">{rating}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserCard
