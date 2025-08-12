import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Calendar, FileText, User, Briefcase } from "lucide-react";

interface SearchFilters {
  query: string;
  documentType: string;
  status: string;
  dateRange: string;
  userRole: string;
}

interface SearchResult {
  id: string;
  type: "user" | "document" | "contract" | "workpermit";
  title: string;
  description: string;
  status: string;
  lastUpdated: Date;
  url?: string;
}

export function AdvancedSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    documentType: "all-types",
    status: "all-statuses",
    dateRange: "any-time",
    userRole: "all-roles"
  });

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    
    // Simulate API call with mock results
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: "1",
          type: "document" as const,
          title: "Passport Front Page - John Doe",
          description: "Uploaded 2 days ago, pending review",
          status: "pending",
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          url: "/docket"
        },
        {
          id: "2", 
          type: "contract" as const,
          title: "Company Contract - Jane Smith",
          description: "Signed and approved",
          status: "signed",
          lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          url: "/contracts"
        },
        {
          id: "3",
          type: "user" as const,
          title: "John Doe",
          description: "User profile - Docket 85% complete",
          status: "active",
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          url: "/profile"
        }
      ].filter(result => 
        !filters.query || 
        result.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        result.description.toLowerCase().includes(filters.query.toLowerCase())
      );

      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      documentType: "all-types",
      status: "all-statuses",
      dateRange: "any-time",
      userRole: "all-roles"
    });
    setSearchResults([]);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "user": return <User className="h-5 w-5 text-blue-600" />;
      case "document": return <FileText className="h-5 w-5 text-green-600" />;
      case "contract": return <Briefcase className="h-5 w-5 text-purple-600" />;
      case "workpermit": return <Calendar className="h-5 w-5 text-orange-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      signed: "bg-green-100 text-green-800",
      active: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800"
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <Search className="h-4 w-4" />
        <span>Advanced Search</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Advanced Search
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Search Query */}
            <div>
              <Label htmlFor="search-query">Search Query</Label>
              <Input
                id="search-query"
                placeholder="Enter search terms..."
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              />
            </div>

            {/* Document Type Filter */}
            <div>
              <Label htmlFor="document-type">Document Type</Label>
              <Select 
                value={filters.documentType} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, documentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All types</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="resume">Resume</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-statuses">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div>
              <Label htmlFor="date-range">Date Range</Label>
              <Select 
                value={filters.dateRange} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any-time">Any time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4">
              <Button onClick={handleSearch} className="flex-1" disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border-t pt-4 max-h-64 overflow-y-auto">
                <h4 className="font-medium mb-3">Search Results ({searchResults.length})</h4>
                <div className="space-y-3">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        {getResultIcon(result.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-sm truncate">
                              {result.title}
                            </h5>
                            {getStatusBadge(result.status)}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {result.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {result.lastUpdated.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.length === 0 && filters.query && !isSearching && (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No results found</p>
              </div>
            )}
          </CardContent>
        </div>
      )}
    </div>
  );
}