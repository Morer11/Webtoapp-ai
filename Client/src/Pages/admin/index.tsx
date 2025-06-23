import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  DollarSign, 
  Smartphone, 
  TrendingUp, 
  Bell, 
  Home,
  UserPlus,
  Plus,
  Edit,
  Trash2,
  BarChart3
} from "lucide-react";
import type { User, PaymentMethod, AdSource } from "@shared/schema";

type AdminTab = 'users' | 'payments' | 'ads' | 'analytics';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: paymentMethods = [] } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/admin/payment-methods'],
  });

  const { data: adSources = [] } = useQuery<AdSource[]>({
    queryKey: ['/api/admin/ad-sources'],
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusBadge = (isActive: boolean) => (
    <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );

  const getPlanBadge = (plan: string) => (
    <Badge className={plan === 'pro' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
      {plan === 'pro' ? 'Pro' : 'Free'}
    </Badge>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
              <p className="text-slate-600">Manage users, payments, and system settings</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="sm">
                <Home className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Navigation */}
        <div className="mb-8">
          <div className="flex space-x-8 border-b border-slate-200">
            {[
              { id: 'users', label: 'Users', icon: Users },
              { id: 'payments', label: 'Payment Methods', icon: DollarSign },
              { id: 'ads', label: 'Ad Sources', icon: Smartphone },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as AdminTab)}
                className={`pb-4 border-b-2 font-medium transition-colors ${
                  activeTab === id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5 inline mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
                <div className="flex items-center space-x-4">
                  <Input
                    type="text"
                    placeholder="Search users..."
                    className="w-64"
                  />
                  <Button className="bg-gradient-to-br from-primary-600 to-primary-800">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-slate-900">
                              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'N/A'}
                            </div>
                            <div className="text-sm text-slate-600">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPlanBadge(user.plan)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.isEmailVerified)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="ghost" size="sm" className="mr-2">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payments' && (
          <Card>
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900">Payment Methods</h2>
                <Button className="bg-gradient-to-br from-primary-600 to-primary-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {paymentMethods.map((method) => (
                  <Card key={method.id} className="border border-slate-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">{method.name}</h3>
                        {getStatusBadge(method.isActive)}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Network</span>
                          <span className="text-slate-900">{method.network}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Address</span>
                          <span className="text-slate-900 font-mono text-xs">
                            {method.address.slice(0, 8)}...{method.address.slice(-4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Type</span>
                          <span className="text-slate-900 capitalize">{method.type}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ad Sources Tab */}
        {activeTab === 'ads' && (
          <Card>
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900">Ad Sources Management</h2>
                <Button className="bg-gradient-to-br from-primary-600 to-primary-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ad Source
                </Button>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="space-y-6">
                {adSources.map((source) => (
                  <Card key={source.id} className="border border-slate-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-slate-900">{source.name}</h3>
                          <p className="text-sm text-slate-600 capitalize">{source.type} ads</p>
                        </div>
                        {getStatusBadge(source.isActive)}
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        {source.appId && (
                          <div>
                            <div className="text-sm text-slate-600">App ID</div>
                            <div className="font-mono text-sm text-slate-900">{source.appId}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-slate-600">Revenue Share</div>
                          <div className="font-semibold text-slate-900">{source.revenueShare}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Type</div>
                          <div className="font-semibold text-slate-900 capitalize">{source.type}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Analytics
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-slate-900">{users.length}</div>
                      <div className="text-sm text-slate-600">Total Users</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-slate-900">$12,450</div>
                      <div className="text-sm text-slate-600">Monthly Revenue</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-slate-900">18,500</div>
                      <div className="text-sm text-slate-600">Apps Generated</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-slate-900">24%</div>
                      <div className="text-sm text-slate-600">Growth Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Placeholder */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <CardContent className="p-0">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Monthly Revenue</h3>
                  <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                    <p className="text-slate-500">Revenue Chart Component</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="p-0">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">User Growth</h3>
                  <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                    <p className="text-slate-500">User Growth Chart Component</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
