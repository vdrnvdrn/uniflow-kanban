import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const TaskFilterBar = ({
  users = [],
  onFilter,
  currentUserId,
  initialFilters = {}
}) => {
  const { t } = useTranslation();

  const [filters, setFilters] = useState({
    state: initialFilters.state || [],
    userId: initialFilters.userId || null,
    search: initialFilters.search || '',
    deadline_from: initialFilters.deadline_from || '',
    deadline_to: initialFilters.deadline_to || '',
  });

  const searchTimeoutRef = useRef(null);

  // Debounce search input (300ms delay)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      onFilter(filters);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filters.search]);

  // Immediate filter update for non-search filters
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (newFilters.search === filters.search) {
      onFilter(newFilters);
    }
  };

  // Toggle state filter
  const toggleStateFilter = (state) => {
    const newStates = filters.state.includes(state)
      ? filters.state.filter(s => s !== state)
      : [...filters.state, state];
    handleFilterChange({ ...filters, state: newStates });
  };

  // Handle user filter change
  const handleUserFilterChange = (e) => {
    const userId = e.target.value ? parseInt(e.target.value) : null;
    handleFilterChange({ ...filters, userId });
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  // Handle deadline from
  const handleDeadlineFromChange = (e) => {
    handleFilterChange({ ...filters, deadline_from: e.target.value });
  };

  // Handle deadline to
  const handleDeadlineToChange = (e) => {
    handleFilterChange({ ...filters, deadline_to: e.target.value });
  };

  // Quick filters for My Tasks
  const handleMyTasks = () => {
    handleFilterChange({
      ...filters,
      userId: currentUserId,
      state: [],
      deadline_from: '',
      deadline_to: '',
      search: ''
    });
  };

  // Quick filter for Overdue tasks
  const handleOverdue = () => {
    const today = new Date().toISOString().split('T')[0];
    handleFilterChange({
      ...filters,
      deadline_to: today,
      state: [],
      userId: null,
      search: ''
    });
  };

  // Quick filter for This Week
  const handleThisWeek = () => {
    const today = new Date();
    const endOfWeek = new Date(today.getTime() + (7 - today.getDay()) * 24 * 60 * 60 * 1000);
    const deadline_from = today.toISOString().split('T')[0];
    const deadline_to = endOfWeek.toISOString().split('T')[0];

    handleFilterChange({
      ...filters,
      deadline_from,
      deadline_to,
      state: [],
      userId: null,
      search: ''
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    const emptyFilters = {
      state: [],
      userId: null,
      search: '',
      deadline_from: '',
      deadline_to: ''
    };
    setFilters(emptyFilters);
    onFilter(emptyFilters);
  };

  // Check if any filter is active
  const isFiltered = filters.state.length > 0 ||
                     filters.userId ||
                     filters.search ||
                     filters.deadline_from ||
                     filters.deadline_to;

  return (
    <div className="glass-card-subtle p-4 mb-4">
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={t('searchTasks')}
          value={filters.search}
          onChange={handleSearchChange}
          className="glass-input"
        />
      </div>

      {/* Filter Row 1: State and User Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* State Filter - Checkboxes */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">
            {t('filterByState')}
          </label>
          <div className="space-y-2">
            {['Todo', 'Doing', 'Done'].map((state) => (
              <label key={state} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.state.includes(state)}
                  onChange={() => toggleStateFilter(state)}
                  className="mr-2 w-4 h-4 accent-white bg-white/10 border-white/20 rounded"
                />
                <span className="text-white/70">{t(state.toLowerCase())}</span>
              </label>
            ))}
          </div>
        </div>

        {/* User Filter - Dropdown */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">
            {t('filterByAssignee')}
          </label>
          <select
            value={filters.userId || ''}
            onChange={handleUserFilterChange}
            className="glass-select"
          >
            <option value="">{t('all')}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Empty column for layout */}
        <div></div>
      </div>

      {/* Filter Row 2: Deadline Range */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">
            {t('filterByDeadline')}
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.deadline_from}
              onChange={handleDeadlineFromChange}
              placeholder={t('from')}
              className="glass-input flex-1"
              title={t('from')}
            />
            <input
              type="date"
              value={filters.deadline_to}
              onChange={handleDeadlineToChange}
              placeholder={t('to')}
              className="glass-input flex-1"
              title={t('to')}
            />
          </div>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={handleMyTasks}
          className="glass-btn-primary glass-btn-sm"
        >
          {t('myTasks')}
        </button>
        <button
          onClick={handleOverdue}
          className="glass-btn-danger glass-btn-sm"
        >
          {t('overdue')}
        </button>
        <button
          onClick={handleThisWeek}
          className="px-4 py-2 bg-white/15 text-white/80 border border-white/30 rounded-lg hover:bg-white/25 transition text-sm font-medium"
        >
          {t('thisWeek')}
        </button>

        {isFiltered && (
          <button
            onClick={handleClearFilters}
            className="glass-btn-secondary glass-btn-sm ml-auto"
          >
            {t('clearFilters')}
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskFilterBar;
