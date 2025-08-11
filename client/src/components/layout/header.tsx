interface HeaderProps {
  title: string;
  subtitle: string;
  onAddClick?: () => void;
  addButtonText?: string;
}

export default function Header({ title, subtitle, onAddClick, addButtonText }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Notification Button */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <i className="fas fa-bell text-lg"></i>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          
          {/* Add Button */}
          {onAddClick && addButtonText && (
            <button 
              onClick={onAddClick}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <i className="fas fa-plus"></i>
              <span>{addButtonText}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
