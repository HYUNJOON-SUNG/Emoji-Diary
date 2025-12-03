interface TableRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

interface DataTableProps {
  data: TableRow[];
}

export function DataTable({ data }: DataTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Inactive':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-300';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'User':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="border-2 border-slate-300 rounded-lg overflow-hidden shadow-md bg-white">
      {/* Table Container with Ledger Lines */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-300">
              <th className="px-6 py-4 text-left text-slate-700 border-r border-slate-200">
                ID
              </th>
              <th className="px-6 py-4 text-left text-slate-700 border-r border-slate-200">
                Name
              </th>
              <th className="px-6 py-4 text-left text-slate-700 border-r border-slate-200">
                Email
              </th>
              <th className="px-6 py-4 text-left text-slate-700 border-r border-slate-200">
                Role
              </th>
              <th className="px-6 py-4 text-left text-slate-700 border-r border-slate-200">
                Status
              </th>
              <th className="px-6 py-4 text-left text-slate-700">
                Last Login
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.id}
                className={`
                  border-b border-slate-200 hover:bg-slate-50 transition-colors
                  ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                `}
              >
                <td className="px-6 py-4 text-slate-600 border-r border-slate-100">
                  {row.id}
                </td>
                <td className="px-6 py-4 text-slate-800 border-r border-slate-100">
                  {row.name}
                </td>
                <td className="px-6 py-4 text-slate-600 border-r border-slate-100">
                  {row.email}
                </td>
                <td className="px-6 py-4 border-r border-slate-100">
                  <span className={`
                    inline-block px-3 py-1 rounded-full text-xs border
                    ${getRoleBadgeColor(row.role)}
                  `}>
                    {row.role}
                  </span>
                </td>
                <td className="px-6 py-4 border-r border-slate-100">
                  <span className={`
                    inline-block px-3 py-1 rounded-full text-xs border
                    ${getStatusColor(row.status)}
                  `}>
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {row.lastLogin}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Ledger Bottom Line */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-3 border-t-2 border-slate-300">
        <p className="text-slate-600 text-sm">
          End of record — Page 1 of 1
        </p>
      </div>
    </div>
  );
}
