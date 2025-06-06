import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home, Package, ShoppingCart, DollarSign, FileText, Settings, Building2, Download, Bot, Keyboard, Save, Upload, PlusCircle, User, Users, Sparkles, AlertTriangle } from 'lucide-react';

// The PDF, Excel, and Word libraries will be loaded via CDN script tags.
// Therefore, the direct import statements are removed.
// import { jsPDF } from 'jspdf';
// import * as XLSX from 'xlsx';
// import { Document, Packer, Paragraph, TextRun } from 'docx';


// Ensure Tailwind CSS is available in the environment.
// This code assumes Tailwind CSS is configured.

// Global context for theme and keyboard mode
const AppContext = React.createContext();

// Helper to safely parse JSON from localStorage, or return raw string if not JSON
const getLocalStorageItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      // If item doesn't exist, store the default value (stringified) for future consistency
      setLocalStorageItem(key, defaultValue);
      return defaultValue;
    }
    // Attempt to parse as JSON. If it fails, return the raw string.
    try {
      // Only attempt JSON.parse if it looks like a JSON object or array
      if (item.startsWith('{') || item.startsWith('[')) {
        return JSON.parse(item);
      }
    } catch (parseError) {
      // If parsing fails for a string that started with { or [, log the error but still return raw
      console.warn(`Could not parse localStorage item "${key}" as JSON, returning raw string. Error:`, parseError);
    }
    return item; // For all other cases (plain strings, numbers, booleans stored as strings, or failed JSON parse)
  } catch (error) {
    console.error(`Error accessing localStorage item "${key}":`, error);
    return defaultValue;
  }
};

// Helper to safely set JSON to localStorage
const setLocalStorageItem = (key, value) => {
  try {
    // Always stringify the value for consistency.
    // If 'value' is a primitive (string, number, boolean), it will be stringified to "value".
    // If 'value' is an object or array, it will be stringified to its JSON representation.
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage item "${key}":`, error);
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAppReady, setIsAppReady] = useState(false); // Renamed from isAuthReady
  const [primaryColor, setPrimaryColor] = useState(getLocalStorageItem('primaryColor', '#2563EB'));
  const [secondaryColor, setSecondaryColor] = useState(getLocalStorageItem('secondaryColor', '#60A5FA'));
  const [textColor, setTextColor] = useState(getLocalStorageItem('textColor', '#1F2937'));
  const [fontSize, setFontSize] = useState(getLocalStorageItem('fontSize', 16)); // Default font size
  const [fontFamily, setFontFamily] = useState(getLocalStorageItem('fontFamily', 'Inter')); // Default font family
  const [keyboardMode, setKeyboardMode] = useState(getLocalStorageItem('keyboardMode', 'mouse-keyboard'));
  const [shortcuts, setShortcuts] = useState(() => {
    return getLocalStorageItem('keyboardShortcuts', {
      'Alt+1': { action: 'Go to Dashboard', tab: 'dashboard' },
      'Alt+2': { action: 'Go to Products', tab: 'products' },
      'Alt+3': { action: 'Go to Sales', tab: 'sales' },
      'Alt+4': { action: 'Go to Purchases', tab: 'purchases' },
      'Alt+5': { action: 'Go to Reports', tab: 'reports' },
      'Alt+6': { action: 'Go to Company Profile', tab: 'company-profile' },
      'Alt+7': { action: 'Go to Settings', tab: 'settings' },
      'Alt+N': { action: 'Add New Product (Products Tab)', target: 'addProduct' }, // Example for specific action
      'Alt+I': { action: 'Generate Invoice (Sales Tab)', target: 'generateInvoice' },
    });
  });

  // Company Profile Image/Name for Header
  const [companyProfileImage, setCompanyProfileImage] = useState(getLocalStorageItem('companyProfile_image', ''));
  const [companyProfileName, setCompanyProfileName] = useState(getLocalStorageItem('companyProfile_name', 'My Pharma Inc.'));
  const [companyProfileAddress, setCompanyProfileAddress] = useState(getLocalStorageItem('companyProfile_address', '123 Pharma Lane, Health City'));
  const [companyProfileGSTIN, setCompanyProfileGSTIN] = useState(getLocalStorageItem('companyProfile_gstin', ''));
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);


  // Simulate app readiness (no auth needed)
  useEffect(() => {
    setIsAppReady(true);
  }, []);

  // Monitor online status for AI features
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Global keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (event) => {
      // If keyboardMode is 'mouse-keyboard', only trigger if Alt key is pressed
      if (keyboardMode === 'mouse-keyboard' && !event.altKey) return;

      const key = [];
      if (event.ctrlKey) key.push('Ctrl');
      if (event.shiftKey) key.push('Shift');
      if (event.altKey) key.push('Alt');
      if (event.key && event.key !== 'Control' && event.key !== 'Shift' && event.key !== 'Alt') {
        key.push(event.key.charAt(0).toUpperCase() + event.key.slice(1));
      }
      const pressedKey = key.join('+');

      const shortcut = shortcuts[pressedKey];
      if (shortcut) {
        event.preventDefault(); // Prevent default browser action for the shortcut
        if (shortcut.tab) {
          setActiveTab(shortcut.tab);
        }
        // Add more specific handlers here if needed for non-tab actions
        console.log(`Shortcut triggered: ${shortcut.action}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardMode, shortcuts, setActiveTab]);


  const renderContent = () => {
    if (!isAppReady) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-600">Loading application...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} onlineStatus={onlineStatus} />;
      case 'products':
        return <ProductManagement onlineStatus={onlineStatus} />;
      case 'sales':
        return <Sales onlineStatus={onlineStatus} companyProfile={{name: companyProfileName, address: companyProfileAddress, gstin: companyProfileGSTIN, image: companyProfileImage}} />;
      case 'purchases':
        return <Purchases />;
      case 'reports':
        return <Reports onlineStatus={onlineStatus} />;
      case 'company-profile':
        return <CompanyProfile
          setCompanyProfileImage={setCompanyProfileImage}
          setCompanyProfileName={setCompanyProfileName}
          setCompanyProfileAddress={setCompanyProfileAddress} /* Passed here */
          setCompanyProfileGSTIN={setCompanyProfileGSTIN}   /* Passed here */
        />;
      case 'settings':
        return <SettingsComponent
          primaryColor={primaryColor} setPrimaryColor={setPrimaryColor}
          secondaryColor={secondaryColor} setSecondaryColor={setSecondaryColor}
          textColor={textColor} setTextColor={setTextColor}
          fontSize={fontSize} setFontSize={setFontSize}
          fontFamily={fontFamily} setFontFamily={setFontFamily}
          keyboardMode={keyboardMode} setKeyboardMode={setKeyboardMode}
          shortcuts={shortcuts} setShortcuts={setShortcuts}
          onlineStatus={onlineStatus}
        />;
      default:
        return <Dashboard setActiveTab={setActiveTab} onlineStatus={onlineStatus} />;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'CP';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  return (
    <AppContext.Provider value={{ primaryColor, secondaryColor, textColor, fontSize, fontFamily, keyboardMode, shortcuts }}>
      {/* CDN for jspdf */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
      {/* CDN for SheetJS (xlsx) */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.5/xlsx.full.min.js"></script>
      {/* CDN for docx */}
      <script src="https://unpkg.com/docx/build/index.js"></script>

      <style>{`
        :root {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
          --text-color: ${textColor};
          --font-size: ${fontSize}px;
          --font-family: ${fontFamily}, sans-serif;

          /* Derive dark variant for primary color for hover effects */
          --primary-color-dark: ${primaryColor.replace(/([0-9a-fA-F]{2})$/, (match) => (parseInt(match, 16) - 30).toString(16).padStart(2, '0'))};
        }
        body {
          font-size: var(--font-size);
          font-family: var(--font-family);
          color: var(--text-color);
        }
        .bg-primary { background-color: var(--primary-color); }
        .text-primary { color: var(--primary-color); }
        .border-primary { border-color: var(--primary-color); }
        .bg-secondary { background-color: var(--secondary-color); }
        .text-secondary { color: var(--secondary-color); }
        .border-secondary { border-color: var(--secondary-color); }
        .hover\\:bg-primary-dark:hover { background-color: var(--primary-color-dark); }
        /* Apply text color globally or selectively */
        .text-gray-800 { color: var(--text-color); }
        .text-gray-600 { color: color-mix(in srgb, var(--text-color) 80%, transparent); }
        .text-gray-500 { color: color-mix(in srgb, var(--text-color) 60%, transparent); }
        .text-gray-900 { color: color-mix(in srgb, var(--text-color) 110%, transparent); } /* Darker text for headings */
      `}</style>
      <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-lg flex flex-col p-4 rounded-r-xl transition-all duration-300 ease-in-out">
          <div className="flex items-center mb-8 mt-2">
            <Building2 className="h-8 w-8 mr-3 text-blue-200" />
            <h1 className="text-2xl font-bold tracking-wide">Pharma ERP</h1>
          </div>
          <nav className="flex-grow">
            <SidebarItem icon={Home} label="Dashboard" tab="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SidebarItem icon={Package} label="Products" tab="products" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SidebarItem icon={ShoppingCart} label="Sales" tab="sales" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SidebarItem icon={DollarSign} label="Purchases" tab="purchases" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SidebarItem icon={FileText} label="Reports" tab="reports" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SidebarItem icon={Building2} label="Company Profile" tab="company-profile" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SidebarItem icon={Settings} label="settings" tab="settings" activeTab={activeTab} setActiveTab={setActiveTab} />
          </nav>
          <div className="mt-auto text-sm text-blue-200 p-2 border-t border-blue-800 pt-4">
            <p>Offline Mode</p>
            <p className="mt-2">© 2025 Pharma ERP. All rights reserved.</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-md p-4 flex items-center justify-between rounded-bl-xl z-10">
            <h2 className="text-2xl font-semibold text-gray-700 capitalize">{activeTab.replace('-', ' ')}</h2>
            <div className="relative">
              {companyProfileImage ? (
                <img
                  src={companyProfileImage}
                  alt="Company Profile"
                  className="w-12 h-12 rounded-full object-cover cursor-pointer border-2 border-primary hover:border-blue-500 transition-colors duration-200"
                  onClick={() => setActiveTab('settings')}
                  title="Click to open Settings"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg cursor-pointer border-2 border-primary hover:border-blue-500 transition-colors duration-200"
                  onClick={() => setActiveTab('settings')}
                  title="Click to open Settings"
                >
                  {getInitials(companyProfileName)}
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="bg-white p-6 rounded-xl shadow-lg h-full">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </AppContext.Provider>
  );
}

// Sidebar Item Component
const SidebarItem = ({ icon: Icon, label, tab, activeTab, setActiveTab }) => {
  const isActive = activeTab === tab;
  return (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center w-full py-3 px-4 mb-2 rounded-lg transition-all duration-200 ease-in-out
        ${isActive ? 'bg-blue-600 text-white shadow-md transform translate-x-1' : 'text-blue-100 hover:bg-blue-700 hover:text-white'}`}
    >
      <Icon className="h-5 w-5 mr-4" />
      <span className="font-medium">{label}</span>
    </button>
  );
};

// Dashboard Component
const Dashboard = ({ setActiveTab, onlineStatus }) => (
  <div className="p-4">
    <h3 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Pharma ERP!</h3>
    <p className="text-lg text-gray-600 mb-8">
      Your comprehensive solution for pharmaceutical business management.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card title="Quick Overview" content="View key metrics and recent activities." onClick={() => setActiveTab('reports')} />
      <Card title="Pending Orders" content="Track and manage your sales and purchase orders." onClick={() => setActiveTab('sales')} />
      <Card title="Inventory Alerts" content="Monitor stock levels and expiry dates." onClick={() => setActiveTab('purchases')} />
    </div>

    <div className="mt-10 p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-inner">
      <h4 className="text-xl font-semibold text-blue-800 mb-3">Application Status</h4>
      <p className="text-blue-700 text-sm break-all">
        Data is saved locally in your browser (`localStorage`).
      </p>
      <div className="flex items-center text-blue-600 text-sm mt-2">
        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${onlineStatus ? 'bg-green-500' : 'bg-red-500'}`}></span>
        Internet Connectivity: {onlineStatus ? 'Online' : 'Offline'}
      </div>
      {!onlineStatus && (
        <p className="text-red-500 text-sm mt-2">
          AI features require an active internet connection.
        </p>
      )}
    </div>
  </div>
);

// Generic Card Component
const Card = ({ title, content, onClick }) => (
  <div
    className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    onClick={onClick}
  >
    <h4 className="text-xl font-semibold text-gray-700 mb-3">{title}</h4>
    <p className="text-gray-600">{content}</p>
  </div>
);

// Confirmation Modal Component
const ConfirmationModal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Product Management Component
const ProductManagement = ({ onlineStatus }) => {
  const [products, setProducts] = useState(getLocalStorageItem('products', []));
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', gstRate: '', description: '', minStockLevel: '', reorderPoint: '' });
  const [editingProduct, setEditingProduct] = useState(null); // Product being edited
  const [aiLoadingGst, setAiLoadingGst] = useState(false);
  const [aiLoadingDescription, setAiLoadingDescription] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // {text, type: 'success' | 'error'}
  const messageTimeoutRef = useRef(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState(null);
  const [product1ForCompatibility, setProduct1ForCompatibility] = useState('');
  const [product2ForCompatibility, setProduct2ForCompatibility] = useState('');
  const [compatibilityResult, setCompatibilityResult] = useState('');
  const [aiLoadingCompatibility, setAiLoadingCompatibility] = useState(false);


  // Clear message after a few seconds
  const showMessage = useCallback((text, type) => {
    setMessage({ text, type });
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setMessage({ text, type });
    }, 5000);
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    setLocalStorageItem('products', products);
  }, [products]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [name]: value });
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.gstRate) {
      showMessage("Please fill all required product fields.", 'error');
      return;
    }
    if (isNaN(newProduct.price) || isNaN(newProduct.stock) || isNaN(newProduct.gstRate)) {
      showMessage("Price, Stock, and GST Rate must be numbers.", 'error');
      return;
    }

    const productToAdd = {
      id: Date.now().toString(), // Unique ID for local storage
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock, 10),
      gstRate: parseFloat(newProduct.gstRate),
      description: newProduct.description,
      minStockLevel: newProduct.minStockLevel ? parseInt(newProduct.minStockLevel, 10) : 0,
      reorderPoint: newProduct.reorderPoint ? parseInt(newProduct.reorderPoint, 10) : 0,
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, productToAdd].sort((a, b) => a.name.localeCompare(b.name)));
    setNewProduct({ name: '', price: '', stock: '', gstRate: '', description: '', minStockLevel: '', reorderPoint: '' });
    showMessage("Product added successfully!", 'success');
  };

  const handleEditClick = (product) => {
    setEditingProduct({ ...product }); // Create a copy to edit
  };

  const handleUpdateProduct = () => {
    if (!editingProduct || !editingProduct.id) return;
    if (!editingProduct.name || !editingProduct.name || !editingProduct.price || !editingProduct.stock || !editingProduct.gstRate) { // Added check for editingProduct.name
      showMessage("Please fill all required product fields for update.", 'error');
      return;
    }
    if (isNaN(editingProduct.price) || isNaN(editingProduct.stock) || isNaN(editingProduct.gstRate)) {
      showMessage("Price, Stock, and GST Rate must be numbers.", 'error');
      return;
    }

    setProducts(prev => prev.map(p =>
      p.id === editingProduct.id
        ? {
            ...editingProduct,
            price: parseFloat(editingProduct.price),
            stock: parseInt(editingProduct.stock, 10),
            gstRate: parseFloat(editingProduct.gstRate),
            minStockLevel: editingProduct.minStockLevel ? parseInt(editingProduct.minStockLevel, 10) : 0,
            reorderPoint: editingProduct.reorderPoint ? parseInt(editingProduct.reorderPoint, 10) : 0,
            updatedAt: new Date().toISOString(),
          }
        : p
    ).sort((a, b) => a.name.localeCompare(b.name)));
    setEditingProduct(null); // Exit edit mode
    showMessage("Product updated successfully!", 'success');
  };

  const handleDeleteProductClick = (id) => {
    setProductToDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmDeleteProduct = () => {
    setShowConfirmModal(false);
    if (!productToDeleteId) return;

    setProducts(prev => prev.filter(p => p.id !== productToDeleteId));
    showMessage("Product deleted successfully!", 'success');
    setProductToDeleteId(null);
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setProductToDeleteId(null);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleAiGstCalculation = async () => {
    if (!onlineStatus) {
      showMessage("AI features require an internet connection.", "error");
      return;
    }
    const productName = editingProduct ? editingProduct.name : newProduct.name;
    if (!productName.trim()) {
      showMessage("Please enter a product name for AI GST calculation.", 'error');
      return;
    }

    setAiLoadingGst(true);
    try {
      let chatHistory = [];
      const prompt = `Given the pharmaceutical product name: "${productName}", what is a likely GST (Goods and Services Tax) percentage in India for this item? Provide only the percentage number (e.g., "18" for 18%). If unsure, provide a common default like "12".`;
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will provide this at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        const parsedGst = parseFloat(text.replace('%', '').trim());
        if (editingProduct) {
          setEditingProduct(prev => ({ ...prev, gstRate: isNaN(parsedGst) ? prev.gstRate : parsedGst }));
        } else {
          setNewProduct(prev => ({ ...prev, gstRate: isNaN(parsedGst) ? prev.gstRate : parsedGst }));
        }
        showMessage("AI GST calculation complete!", 'success');
      } else {
        showMessage("AI GST calculation failed.", 'error');
      }
    } catch (error) {
      console.error("Error calling AI for GST:", error);
      showMessage("Error calling AI for GST: " + error.message, 'error');
    } finally {
      setAiLoadingGst(false);
    }
  };

  const handleAiGenerateDescription = async () => {
    if (!onlineStatus) {
      showMessage("AI features require an internet connection.", "error");
      return;
    }
    const productName = editingProduct ? editingProduct.name : newProduct.name;
    if (!productName.trim()) {
      showMessage("Please enter a product name to generate a description.", 'error');
      return;
    }

    setAiLoadingDescription(true);
    try {
      let chatHistory = [];
      const prompt = `Generate a concise, professional, and informative pharmaceutical product description for "${productName}". Include its primary use and key benefits. Keep it under 50 words.`;
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will provide this at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const descriptionText = result.candidates[0].content.parts[0].text;
        if (editingProduct) {
          setEditingProduct(prev => ({ ...prev, description: descriptionText }));
        } else {
          setNewProduct(prev => ({ ...prev, description: descriptionText }));
        }
        showMessage("AI description generated!", 'success');
      } else {
        showMessage("Failed to generate description.", 'error');
      }
    } catch (error) {
      console.error("Error generating description:", error);
      showMessage("Error generating description: " + error.message, 'error');
    } finally {
      setAiLoadingDescription(false);
    }
  };

  const handleCheckCompatibility = async () => {
    if (!onlineStatus) {
      showMessage("AI features require an internet connection.", "error");
      return;
    }
    if (!product1ForCompatibility.trim() || !product2ForCompatibility.trim()) {
      showMessage("Please enter both product names to check compatibility.", 'error');
      return;
    }

    setAiLoadingCompatibility(true);
    setCompatibilityResult('');
    try {
      let chatHistory = [];
      const prompt = `Are the following two pharmaceutical products compatible or are there common interactions/contraindications between them? Provide a brief, concise answer (max 3 sentences). Products: "${product1ForCompatibility}" and "${product2ForCompatibility}".`;
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will provide this at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setCompatibilityResult(text);
        showMessage("AI compatibility check complete!", 'success');
      } else {
        setCompatibilityResult('Could not determine compatibility. Try again.');
        showMessage("AI compatibility check failed.", 'error');
      }
    } catch (error) {
      console.error("Error calling AI for compatibility:", error);
      setCompatibilityResult('Error during AI compatibility check.');
      showMessage("Error calling AI for compatibility: " + error.message, 'error');
    } finally {
      setAiLoadingCompatibility(false);
    }
  };


  const handleExportData = (format) => {
    // Access jsPDF and XLSX from the global window object
    const { jsPDF } = window.jspdf; // Assuming jspdf exports UMD with 'jspdf'
    const XLSX = window.XLSX;
    const { Document, Packer, Paragraph, TextRun } = window.docx;


    if (products.length === 0) {
      showMessage("No data to export.", 'error');
      return;
    }

    let content = '';
    let filename = `pharma_products.${format}`;
    let mimeType = '';

    switch (format) {
      case 'csv':
        const csvHeader = ["ID", "Name", "Price", "Stock", "GST Rate", "Description", "Min Stock Level", "Reorder Point", "Created At", "Updated At"].join(',');
        const csvRows = products.map(p =>
          [
            `"${p.id}"`,
            `"${p.name.replace(/"/g, '""')}"`, // Escape double quotes
            p.price,
            p.stock,
            p.gstRate,
            `"${p.description ? p.description.replace(/"/g, '""') : ''}"`,
            p.minStockLevel || '',
            p.reorderPoint || '',
            p.createdAt || '',
            p.updatedAt || ''
          ].join(',')
        );
        content = [csvHeader, ...csvRows].join('\n');
        mimeType = 'text/plain;charset=utf-8;'; // Changed to text/plain
        filename = `pharma_products.txt`; // Save as .txt
        break;
      case 'json':
        content = JSON.stringify(products, null, 2);
        mimeType = 'application/json;charset=utf-8;';
        filename = `pharma_products.txt`; // Save as .txt
        break;
      case 'pdf':
        try {
          const doc = new jsPDF();
          doc.text("Product List", 10, 10);
          let y = 20;
          products.forEach(p => {
            doc.text(`${p.name} - Price: ${p.price}, Stock: ${p.stock}`, 10, y);
            y += 10;
          });
          doc.save("pharma_products.pdf");
          showMessage(`PDF for products generated and downloaded! (Library Used)`, 'success');
        } catch (e) {
          console.error("Error generating PDF:", e);
          showMessage(`Error generating PDF for products (ensure library is loaded).`, 'error');
        }
        return;
      case 'excel':
        try {
          const ws = XLSX.utils.json_to_sheet(products);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Products");
          XLSX.writeFile(wb, "pharma_products.xlsx");
          showMessage(`Excel for products generated and downloaded! (Library Used)`, 'success');
        } catch (e) {
          console.error("Error generating Excel:", e);
          showMessage(`Error generating Excel for products (ensure library is loaded).`, 'error');
        }
        return;
      case 'word':
        try {
          const doc = new Document({
            sections: [{
              properties: {},
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Pharma Product List",
                      bold: true,
                      size: 32, // 16pt
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Generated on: ${new Date().toLocaleDateString()}`,
                      size: 20, // 10pt
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "\nProducts:\n",
                      bold: true,
                    }),
                  ],
                }),
                ...products.map(p => new Paragraph({
                  children: [
                    new TextRun(`${p.name} (Price: ₹${p.price}, Stock: ${p.stock})`),
                  ],
                })),
              ],
            }],
          });

          Packer.toBlob(doc).then(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'pharma_products.docx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showMessage(`Word document for products generated and downloaded! (Library Used)`, 'success');
          }).catch(e => {
            console.error("Error generating Word document:", e);
            showMessage(`Error generating Word document for products.`, 'error');
          });
        } catch (e) {
          console.error("Error setting up Word document generation:", e);
          showMessage(`Error setting up Word document generation for products.`, 'error');
        }
        return;
      case 'print':
        showMessage(`Opening print dialog for products.`, 'success');
        window.print(); // Triggers browser print dialog
        return;
      default:
        showMessage("Unsupported export format.", 'error');
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showMessage(`Product data exported successfully as ${format.toUpperCase()}!`, 'success');
    } else {
      showMessage("Your browser does not support downloading files directly. Please copy the data manually.", 'error');
      console.log(content);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-3xl font-bold text-gray-800 mb-6">Product Management</h3>

      {message.text && (
        <div className={`p-4 mb-4 rounded-lg text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} transition-opacity duration-300 ease-in-out`}>
          {message.text}
        </div>
      )}

      <ConfirmationModal
        show={showConfirmModal}
        title="Confirm Deletion"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={confirmDeleteProduct}
        onCancel={handleCancelDelete}
      />

      {/* Add/Edit Product Form */}
      <div className="bg-blue-50 p-6 rounded-xl shadow-inner mb-8 border border-blue-200">
        <h4 className="text-2xl font-semibold text-blue-800 mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={editingProduct ? editingProduct.name : newProduct.name}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={editingProduct ? editingProduct.price : newProduct.price}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock Quantity"
            value={editingProduct ? editingProduct.stock : newProduct.stock}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="gstRate"
              placeholder="GST Rate (%)"
              value={editingProduct ? editingProduct.gstRate : newProduct.gstRate}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            />
            <button
              onClick={handleAiGstCalculation}
              disabled={aiLoadingGst || !(editingProduct ? editingProduct.name : newProduct.name).trim() || !onlineStatus}
              className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              title="Suggest GST Rate with AI (Requires Internet)"
            >
              {aiLoadingGst ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> : <Sparkles className="h-5 w-5" />}
            </button>
          </div>
          <input
            type="number"
            name="minStockLevel"
            placeholder="Min Stock Level"
            value={editingProduct ? editingProduct.minStockLevel : newProduct.minStockLevel}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
          />
          <input
            type="number"
            name="reorderPoint"
            placeholder="Reorder Point"
            value={editingProduct ? editingProduct.reorderPoint : newProduct.reorderPoint}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div className="mb-4">
          <textarea
            name="description"
            placeholder="Product Description"
            value={editingProduct ? editingProduct.description : newProduct.description}
            onChange={handleInputChange}
            rows="3"
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
          ></textarea>
          <button
            onClick={handleAiGenerateDescription}
            disabled={aiLoadingDescription || !(editingProduct ? editingProduct.name : newProduct.name).trim() || !onlineStatus}
            className="mt-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Generate Description with AI (Requires Internet)"
          >
            {aiLoadingDescription ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Generating...
              </span>
            ) : (
              <><Sparkles className="h-5 w-5 mr-2" /> Generate Description</>
            )}
          </button>
        </div>
        <div className="flex gap-4">
          {editingProduct ? (
            <>
              <button
                onClick={handleUpdateProduct}
                className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md flex items-center justify-center"
              >
                Update Product
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md flex items-center justify-center"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleAddProduct}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md flex items-center justify-center"
            >
              Add Product
            </button>
          )}
        </div>
      </div>

      {/* AI Product Compatibility Checker */}
      <div className="bg-purple-50 p-6 rounded-xl shadow-inner mb-8 border border-purple-200">
        <h4 className="text-2xl font-semibold text-purple-800 mb-4 flex items-center">
          <Bot className="h-6 w-6 mr-2" /> AI Product Compatibility Checker
        </h4>
        <p className="text-purple-700 mb-4">
          Enter two product names to check their compatibility or potential interactions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Product 1 Name (e.g., Paracetamol)"
            value={product1ForCompatibility}
            onChange={(e) => setProduct1ForCompatibility(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
          />
          <input
            type="text"
            placeholder="Product 2 Name (e.g., Ibuprofen)"
            value={product2ForCompatibility}
            onChange={(e) => setProduct2ForCompatibility(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
          />
        </div>
        <button
          onClick={handleCheckCompatibility}
          disabled={aiLoadingCompatibility || !product1ForCompatibility.trim() || !product2ForCompatibility.trim() || !onlineStatus}
          className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          title="Check Compatibility (Requires Internet)"
        >
          {aiLoadingCompatibility ? (
            <span className="flex items-center">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
              Checking...
            </span>
          ) : (
            'Check Compatibility'
          )}
        </button>
        {compatibilityResult && (
          <p className="text-lg text-purple-800 font-semibold mt-4">
            Compatibility Result: <span className="text-purple-900">{compatibilityResult}</span>
          </p>
        )}
      </div>

      {/* Product List */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-2xl font-semibold text-gray-800">Your Products</h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportData('csv')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <Download className="h-5 w-5 mr-2" /> CSV
            </button>
            <button
              onClick={() => handleExportData('json')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <Download className="h-5 w-5 mr-2" /> JSON
            </button>
            <button
              onClick={() => handleExportData('pdf')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <Download className="h-5 w-5 mr-2" /> PDF
            </button>
            <button
              onClick={() => handleExportData('excel')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <Download className="h-5 w-5 mr-2" /> Excel
            </button>
            <button
              onClick={() => handleExportData('word')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <Download className="h-5 w-5 mr-2" /> Word
            </button>
            <button
              onClick={() => handleExportData('print')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <FileText className="h-5 w-5 mr-2" /> Print
            </button>
          </div>
        </div>
        {products.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No products added yet. Start by adding a new product above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Pt.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Rate (%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.stock}
                      {product.stock < product.minStockLevel && (
                        <AlertTriangle className="inline-block ml-2 h-4 w-4 text-red-500" title="Below minimum stock" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.minStockLevel || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.reorderPoint || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.gstRate}%</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">{product.description || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-150"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProductClick(product.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-150"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Sales Component
const Sales = ({ onlineStatus, companyProfile }) => {
  const [salesRecords, setSalesRecords] = useState(getLocalStorageItem('salesRecords', []));
  const [customers, setCustomers] = useState(getLocalStorageItem('customers', []));
  const [products, setProducts] = useState(getLocalStorageItem('products', []));
  const [purchaseRecords, setPurchaseRecords] = useState(getLocalStorageItem('purchaseRecords', [])); // Needed for batch expiry
  const [invoiceItems, setInvoiceItems] = useState([
    { id: Date.now(), productId: '', quantity: 0, discount: 0, batchNumber: '', expiryDate: '', unitPrice: 0, itemInsight: '', aiLoading: false }
  ]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [newCustomerDetails, setNewCustomerDetails] = useState({ name: '', gstin: '', contact: '' });
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);
  const [transactionType, setTransactionType] = useState('intra-state'); // 'intra-state' or 'inter-state'

  const [message, setMessage] = useState({ text: '', type: '' });
  const messageTimeoutRef = useRef(null);

  const showMessage = useCallback((text, type) => {
    setMessage({ text, type });
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setMessage({ text, type });
    }, 5000);
  }, []);

  // Load data from localStorage on component mount
  useEffect(() => {
    setSalesRecords(getLocalStorageItem('salesRecords', []).sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate)));
    setCustomers(getLocalStorageItem('customers', []).sort((a, b) => a.name.localeCompare(b.name)));
    setProducts(getLocalStorageItem('products', []));
    setPurchaseRecords(getLocalStorageItem('purchaseRecords', []));
  }, []);

  // Save data to localStorage whenever relevant state changes
  useEffect(() => {
    setLocalStorageItem('salesRecords', salesRecords);
  }, [salesRecords]);

  useEffect(() => {
    setLocalStorageItem('customers', customers);
  }, [customers]);

  const handleCustomerChange = (e) => {
    setSelectedCustomer(e.target.value);
    if (e.target.value === 'addNew') {
      setIsAddingNewCustomer(true);
      setNewCustomerDetails({ name: '', gstin: '', contact: '' });
    } else {
      setIsAddingNewCustomer(false);
    }
  };

  const handleNewCustomerInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomerDetails({ ...newCustomerDetails, [name]: value });
  };

  const handleAddCustomer = () => {
    if (!newCustomerDetails.name) {
      showMessage("Customer name is required.", 'error');
      return;
    }
    const customerToAdd = {
      id: Date.now().toString(),
      name: newCustomerDetails.name,
      gstin: newCustomerDetails.gstin,
      contact: newCustomerDetails.contact,
    };
    setCustomers(prev => [...prev, customerToAdd].sort((a, b) => a.name.localeCompare(b.name)));
    showMessage("Customer added successfully!", 'success');
    setSelectedCustomer(customerToAdd.id); // Select the newly added customer
    setIsAddingNewCustomer(false);
  };

  const handleInvoiceItemChange = (id, field, value) => {
    setInvoiceItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'productId') {
            const selectedProduct = products.find(p => p.id === value);
            if (selectedProduct) {
              updatedItem.unitPrice = selectedProduct.price;
              // Reset batch and expiry when product changes
              updatedItem.batchNumber = '';
              updatedItem.expiryDate = '';
            }
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleGetItemInsight = async (itemId, productName) => {
    if (!onlineStatus) {
      showMessage("AI features require an internet connection.", "error");
      return;
    }
    if (!productName) {
      showMessage("Select a product first to get insight.", 'error');
      return;
    }
    setInvoiceItems(prevItems => prevItems.map(item =>
      item.id === itemId ? { ...item, aiLoading: true } : item
    ));

    try {
      let chatHistory = [];
      const prompt = `Provide a very brief, one-sentence insight or categorization for the pharmaceutical product: "${productName}". Focus on its common use or type.`;
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      let insight = 'No insight available.';
      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
        insight = result.candidates[0].content.parts[0].text;
      }
      setInvoiceItems(prevItems => prevItems.map(item =>
        item.id === itemId ? { ...item, itemInsight: insight, aiLoading: false } : item
      ));
      showMessage("Item insight generated!", 'success');
    } catch (error) {
      console.error("Error getting item insight:", error);
      setInvoiceItems(prevItems => prevItems.map(item =>
        item.id === itemId ? { ...item, itemInsight: 'Error generating insight.', aiLoading: false } : item
      ));
      showMessage("Error generating item insight.", 'error');
    }
  };


  const addInvoiceItem = () => {
    setInvoiceItems(prevItems => [
      ...prevItems,
      { id: Date.now(), productId: '', quantity: 0, discount: 0, batchNumber: '', expiryDate: '', unitPrice: 0, itemInsight: '', aiLoading: false }
    ]);
  };

  const removeInvoiceItem = (id) => {
    setInvoiceItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalGST = 0;
    let sgst = 0;
    let cgst = 0;
    let igst = 0;

    invoiceItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const itemAmount = item.quantity * item.unitPrice;
        const itemDiscount = itemAmount * (item.discount / 100);
        const netAmount = itemAmount - itemDiscount;
        subtotal += netAmount;
        totalDiscount += itemDiscount;

        const gstRate = product.gstRate || 0;
        const itemGST = netAmount * (gstRate / 100);
        totalGST += itemGST;

        if (transactionType === 'intra-state') {
          sgst += itemGST / 2;
          cgst += itemGST / 2;
        } else {
          igst += itemGST;
        }
      }
    });

    const grandTotal = subtotal + totalGST;

    return { subtotal, totalDiscount, totalGST, sgst, cgst, igst, grandTotal };
  };

  const { subtotal, totalDiscount, totalGST, sgst, cgst, igst, grandTotal } = calculateTotals();

  const handleGenerateInvoice = () => {
    if (!selectedCustomer && !isAddingNewCustomer) {
      showMessage("Please select a customer or add a new one.", 'error');
      return;
    }
    if (invoiceItems.length === 0 || invoiceItems.some(item => !item.productId || item.quantity <= 0)) {
      showMessage("Please add at least one valid product item to the invoice.", 'error');
      return;
    }

    let customerDetailsToSave;
    if (isAddingNewCustomer) { // Check if new customer is being added in this flow
      if (!newCustomerDetails.name) {
        showMessage("New customer name is required.", 'error');
        return;
      }
      const customerToAdd = {
        id: Date.now().toString(),
        name: newCustomerDetails.name,
        gstin: newCustomerDetails.gstin,
        contact: newCustomerDetails.contact,
      };
      setCustomers(prev => [...prev, customerToAdd].sort((a, b) => a.name.localeCompare(b.name)));
      customerDetailsToSave = customerToAdd;
    } else {
      customerDetailsToSave = customers.find(c => c.id === selectedCustomer);
    }

    if (!customerDetailsToSave) {
      showMessage("Invalid customer selected.", 'error');
      return;
    }

    const invoiceData = {
      id: Date.now().toString(), // Unique ID for local storage
      customerId: customerDetailsToSave.id,
      customerDetails: customerDetailsToSave,
      invoiceItems: invoiceItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          productName: product ? product.name : 'Unknown Product',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          gstRate: product ? product.gstRate : 0,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          itemInsight: item.itemInsight || '', // Include AI insight
        };
      }),
      subtotal,
      totalDiscount,
      totalGST,
      sgst,
      cgst,
      igst,
      grandTotal,
      transactionType,
      saleDate: new Date().toISOString(),
    };

    setSalesRecords(prev => [...prev, invoiceData].sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate)));
    showMessage("Invoice generated successfully!", 'success');
    // Reset form
    setSelectedCustomer('');
    setIsAddingNewCustomer(false);
    setNewCustomerDetails({ name: '', gstin: '', contact: '' });
    setInvoiceItems([{ id: Date.now(), productId: '', quantity: 0, discount: 0, batchNumber: '', expiryDate: '', unitPrice: 0, itemInsight: '', aiLoading: false }]);
  };

  const generatePdfInvoice = (invoice) => {
    // Access jsPDF from the global window object
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();
    let y = 10; // Y-coordinate for content

    // Company Logo (if available)
    if (companyProfile.image) {
        const img = new Image();
        img.src = companyProfile.image;
        // Adjust width/height as needed, and position (x, y, width, height)
        // This is a basic example; you might need more complex scaling/positioning
        doc.addImage(img, 'PNG', 10, y, 30, 30); // Example: x=10, y=10, width=30, height=30
        y += 35; // Move down after image
    }

    doc.setFontSize(16);
    doc.text(`${companyProfile.name || 'Your Company Name'}`, 105, y, { align: 'center' });
    y += 7;
    doc.setFontSize(10);
    doc.text(`${companyProfile.address || 'Address Line 1'}`, 105, y, { align: 'center' });
    y += 5;
    if (companyProfile.gstin) {
      doc.text(`GSTIN: ${companyProfile.gstin}`, 105, y, { align: 'center' });
      y += 5;
    }
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y); // Horizontal line
    y += 10;

    doc.setFontSize(14);
    doc.text('Invoice', 105, y, { align: 'center' });
    y += 10;

    doc.setFontSize(10);
    doc.text(`Invoice ID: ${invoice.id.substring(0, 8)}`, 10, y);
    doc.text(`Date: ${new Date(invoice.saleDate).toLocaleDateString()}`, 150, y);
    y += 7;
    doc.text(`Customer: ${invoice.customerDetails.name}`, 10, y);
    y += 5;
    doc.text(`Customer GSTIN: ${invoice.customerDetails.gstin || 'N/A'}`, 10, y);
    y += 5;
    doc.text(`Customer Contact: ${invoice.customerDetails.contact || 'N/A'}`, 10, y);
    y += 10;

    doc.setFontSize(12);
    doc.text('Items:', 10, y);
    y += 7;

    // Table Headers
    doc.setFontSize(10);
    doc.text('Product Name', 10, y);
    doc.text('Qty', 70, y);
    doc.text('Unit Price', 90, y);
    doc.text('Discount (%)', 120, y);
    doc.text('GST Rate (%)', 150, y);
    doc.text('Amount (₹)', 180, y);
    y += 5;
    doc.line(10, y, 200, y); // Separator line
    y += 5;

    // Table Rows
    invoice.invoiceItems.forEach(item => {
      const itemAmount = item.quantity * item.unitPrice * (1 - item.discount / 100);
      doc.text(`${item.productName}`, 10, y);
      doc.text(`${item.quantity}`, 70, y);
      doc.text(`${item.unitPrice.toFixed(2)}`, 90, y);
      doc.text(`${item.discount.toFixed(2)}`, 120, y);
      doc.text(`${item.gstRate.toFixed(2)}`, 150, y);
      doc.text(`${itemAmount.toFixed(2)}`, 180, y);
      y += 7;
    });
    doc.line(10, y, 200, y); // Separator line
    y += 5;

    doc.setFontSize(10);
    doc.text(`Subtotal: ₹${invoice.subtotal.toFixed(2)}`, 150, y);
    y += 5;
    doc.text(`Total Discount: ₹${invoice.totalDiscount.toFixed(2)}`, 150, y);
    y += 5;
    if (invoice.transactionType === 'intra-state') {
      doc.text(`CGST: ₹${invoice.cgst.toFixed(2)}`, 150, y);
      y += 5;
      doc.text(`SGST: ₹${invoice.sgst.toFixed(2)}`, 150, y);
      y += 5;
    } else {
      doc.text(`IGST: ₹${invoice.igst.toFixed(2)}`, 150, y);
      y += 5;
    }
    doc.setFontSize(12);
    doc.text(`Grand Total: ₹${invoice.grandTotal.toFixed(2)}`, 150, y);
    y += 10;

    doc.save(`invoice_${invoice.id.substring(0, 8)}.pdf`);
    showMessage("PDF invoice generated and downloaded!", 'success');
  };


  const handleExportData = async (format) => {
    // Access XLSX and docx from the global window object
    const XLSX = window.XLSX;
    const { Document, Packer, Paragraph, TextRun } = window.docx;

    if (salesRecords.length === 0) {
      showMessage("No data to export.", 'error');
      return;
    }
    let content = '';
    let filename = `pharma_sales.${format}`;
    let mimeType = '';

    switch (format) {
      case 'csv':
        const csvHeader = ["Invoice ID", "Customer Name", "Customer GSTIN", "Customer Contact", "Product Name", "Quantity", "Unit Price", "Discount", "GST Rate", "Batch No.", "Expiry Date", "Item Insight", "Subtotal", "Total Discount", "Total GST", "SGST", "CGST", "IGST", "Grand Total", "Transaction Type", "Sale Date"].join(',');
        const csvRows = salesRecords.flatMap(sale =>
          sale.invoiceItems.map(item =>
            [
              `"${sale.id}"`,
              `"${sale.customerDetails?.name.replace(/"/g, '""') || 'N/A'}"`,
              `"${sale.customerDetails?.gstin || ''}"`,
              `"${sale.customerDetails?.contact || ''}"`,
              `"${item.productName.replace(/"/g, '""')}"`,
              item.quantity,
              item.unitPrice,
              item.discount,
              item.gstRate,
              `"${item.batchNumber || ''}"`,
              `"${item.expiryDate || ''}"`,
              `"${item.itemInsight ? item.itemInsight.replace(/"/g, '""') : ''}"`,
              sale.subtotal,
              sale.totalDiscount,
              sale.totalGST,
              sale.sgst,
              sale.cgst,
              sale.igst,
              sale.grandTotal,
              sale.transactionType,
              sale.saleDate || ''
            ].join(',')
          )
        );
        content = [csvHeader, ...csvRows].join('\n');
        mimeType = 'text/plain;charset=utf-8;'; // Changed to text/plain
        filename = `pharma_sales.txt`; // Save as .txt
        break;
      case 'json':
        content = JSON.stringify(salesRecords, null, 2);
        mimeType = 'application/json;charset=utf-8;';
        filename = `pharma_sales.txt`; // Save as .txt
        break;
      case 'pdf':
        if (salesRecords.length > 0) {
          generatePdfInvoice(salesRecords[0]); // Generate PDF for the first sale record as an example
        } else {
          showMessage("No sales records to generate PDF.", 'error');
        }
        return; // Exit function after attempting PDF generation
      case 'excel':
        try {
          const ws = XLSX.utils.json_to_sheet(salesRecords.map(s => ({
            'Invoice ID': s.id,
            'Customer Name': s.customerDetails?.name,
            'Total Amount': s.grandTotal,
            'Date': new Date(s.saleDate).toLocaleDateString(),
            'Items': s.invoiceItems.map(item => `${item.productName} (x${item.quantity})`).join(', ')
          })));
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
          XLSX.writeFile(wb, "pharma_sales_report.xlsx");
          showMessage(`Excel for sales generated and downloaded! (Library Used)`, 'success');
        } catch (e) {
          console.error("Error generating Excel:", e);
          showMessage(`Error generating Excel for sales (ensure valid data).`, 'error');
        }
        return;
      case 'word':
        try {
          const doc = new Document({
            sections: [{
              properties: {},
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Pharma Sales Report",
                      bold: true,
                      size: 32, // 16pt
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Generated on: ${new Date().toLocaleDateString()}`,
                      size: 20, // 10pt
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "\nSales Records:\n",
                      bold: true,
                    }),
                  ],
                }),
                ...salesRecords.map(sale => new Paragraph({
                  children: [
                    new TextRun(`Invoice ID: ${sale.id.substring(0, 8)}, Customer: ${sale.customerDetails?.name}, Total: ₹${sale.grandTotal.toFixed(2)}, Date: ${new Date(sale.saleDate).toLocaleDateString()}`),
                  ],
                })),
              ],
            }],
          });

          Packer.toBlob(doc).then(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'pharma_sales_report.docx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showMessage(`Word document for sales generated and downloaded! (Library Used)`, 'success');
          }).catch(e => {
            console.error("Error generating Word document:", e);
            showMessage(`Error generating Word document for sales.`, 'error');
          });
        } catch (e) {
          console.error("Error setting up Word document generation:", e);
          showMessage(`Error setting up Word document generation for sales.`, 'error');
        }
        return;
      case 'print':
        showMessage(`Opening print dialog for sales.`, 'success');
        window.print();
        return;
      default:
        showMessage("Unsupported export format.", 'error');
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showMessage(`Sales data exported successfully as ${format.toUpperCase()}!`, 'success');
    } else {
      showMessage("Your browser does not support downloading files directly. Please copy the data manually.", 'error');
      console.log(content);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-3xl font-bold text-gray-800 mb-6">Sales Management & Billing</h3>

      {message.text && (
        <div className={`p-4 mb-4 rounded-lg text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} transition-opacity duration-300 ease-in-out`}>
          {message.text}
        </div>
      )}

      {/* Customer Selection / Add New */}
      <div className="bg-blue-50 p-6 rounded-xl shadow-inner mb-8 border border-blue-200">
        <h4 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center">
          <User className="h-6 w-6 mr-2" /> Customer Details (Sundry Debtor)
        </h4>
        <div className="mb-4">
          <label htmlFor="customerSelect" className="block text-gray-700 text-sm font-bold mb-2">Select Existing Customer:</label>
          <select
            id="customerSelect"
            value={selectedCustomer}
            onChange={handleCustomerChange}
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          >
            <option value="">-- Select Customer --</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} ({customer.gstin || 'N/A'})
              </option>
            ))}
            <option value="addNew">-- Add New Customer --</option>
          </select>
        </div>

        {isAddingNewCustomer && (
          <div className="mt-4 p-4 bg-blue-100 rounded-lg border border-blue-300">
            <h5 className="text-xl font-semibold text-blue-700 mb-3">Add New Customer:</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Customer Name"
                value={newCustomerDetails.name}
                onChange={handleNewCustomerInputChange}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="gstin"
                placeholder="GSTIN (Optional)"
                value={newCustomerDetails.gstin}
                onChange={handleNewCustomerInputChange}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="contact"
                placeholder="Contact (Optional)"
                value={newCustomerDetails.contact}
                onChange={handleNewCustomerInputChange}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={handleAddCustomer}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
            >
              Save New Customer
            </button>
          </div>
        )}
      </div>

      {/* Invoice Details */}
      <div className="bg-green-50 p-6 rounded-xl shadow-inner mb-8 border border-green-200">
        <h4 className="text-2xl font-semibold text-green-800 mb-4">Invoice Details</h4>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Transaction Type for GST:</label>
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-400 transition-all duration-200"
          >
            <option value="intra-state">Intra-State (SGST + CGST)</option>
            <option value="inter-state">Inter-State (IGST)</option>
          </select>
        </div>

        {invoiceItems.map((item, index) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 p-3 border border-green-100 rounded-lg bg-white shadow-sm">
            <div className="col-span-2">
              <label className="block text-gray-700 text-xs font-bold mb-1">Product:</label>
              <select
                value={item.productId}
                onChange={(e) => handleInvoiceItemChange(item.id, 'productId', e.target.value)}
                className="p-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-400"
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (₹{product.price.toFixed(2)}, GST: {product.gstRate}%)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1">Quantity:</label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleInvoiceItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                className="p-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1">Unit Price (₹):</label>
              <input
                type="number"
                value={item.unitPrice.toFixed(2)}
                readOnly
                className="p-2 border border-gray-300 rounded-lg w-full bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1">Discount (%):</label>
              <input
                type="number"
                value={item.discount}
                onChange={(e) => handleInvoiceItemChange(item.id, 'discount', parseFloat(e.target.value) || 0)}
                className="p-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="flex items-end">
              {invoiceItems.length > 1 && (
                <button
                  onClick={() => removeInvoiceItem(item.id)}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all duration-200 shadow-sm w-full"
                >
                  Remove
                </button>
              )}
            </div>
            {/* Batch and Expiry for the selected product */}
            {item.productId && (
              <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-gray-700 text-xs font-bold mb-1">Batch Number:</label>
                  <select
                    value={item.batchNumber}
                    onChange={(e) => {
                      const selectedBatch = purchaseRecords.find(p => p.batchNumber === e.target.value && p.productName === products.find(prod => prod.id === item.productId)?.name);
                      handleInvoiceItemChange(item.id, 'batchNumber', e.target.value);
                      if (selectedBatch) {
                        handleInvoiceItemChange(item.id, 'expiryDate', selectedBatch.expiryDate);
                      } else {
                        handleInvoiceItemChange(item.id, 'expiryDate', ''); // Clear expiry if no batch or 'Select Batch'
                      }
                    }}
                    className="p-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-400"
                  >
                    <option value="">Select Batch</option>
                    {products.find(p => p.id === item.productId) && purchaseRecords
                      .filter(pr => pr.productName === products.find(p => p.id === item.productId).name)
                      .filter(pr => new Date(pr.expiryDate) > new Date()) // Only non-expired batches
                      .map(pr => (
                        <option key={pr.id} value={pr.batchNumber}>
                          {pr.batchNumber} (Exp: {new Date(pr.expiryDate).toLocaleDateString()})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="block text-gray-700 text-xs font-bold mb-1">Expiry Date:</label>
                  <input
                    type="date"
                    value={item.expiryDate}
                    readOnly={!!item.batchNumber} // Read-only if batch is selected
                    onChange={(e) => handleInvoiceItemChange(item.id, 'expiryDate', e.target.value)} // Allow manual edit if not readOnly
                    className={`p-2 border border-gray-300 rounded-lg w-full ${item.batchNumber ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-green-400'}`}
                  />
                </div>
              </div>
            )}
            {item.productId && (
              <div className="col-span-full mt-2">
                <button
                  onClick={() => handleGetItemInsight(item.id, products.find(p => p.id === item.productId)?.name)}
                  disabled={item.aiLoading || !products.find(p => p.id === item.productId)?.name || !onlineStatus}
                  className="bg-purple-600 text-white py-1 px-3 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md flex items-center justify-center text-sm disabled:opacity50 disabled:cursor-not-allowed"
                  title="Get Item Insight (Requires Internet)"
                >
                  {item.aiLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></span>
                      Getting Insight...
                    </span>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-1" /> Get Item Insight</>
                  )}
                </button>
                {item.itemInsight && <p className="text-xs text-gray-600 mt-1 italic">Insight: {item.itemInsight}</p>}
              </div>
            )}
          </div>
        ))}
        <button
          onClick={addInvoiceItem}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md flex items-center"
        >
          <PlusCircle className="h-5 w-5 mr-2" /> Add More Products
        </button>

        {/* Invoice Totals */}
        <div className="mt-8 p-6 bg-green-100 rounded-xl border border-green-300">
          <h5 className="text-xl font-semibold text-green-800 mb-4">Invoice Summary</h5>
          <div className="grid grid-cols-2 gap-4 text-lg">
            <p>Subtotal:</p> <p className="text-right font-semibold">₹{subtotal.toFixed(2)}</p>
            <p>Total Discount:</p> <p className="text-right font-semibold">₹{totalDiscount.toFixed(2)}</p>
            {transactionType === 'intra-state' ? (
              <>
                <p>CGST:</p> <p className="text-right font-semibold">₹{cgst.toFixed(2)}</p>
                <p>SGST:</p> <p className="text-right font-semibold">₹{sgst.toFixed(2)}</p>
              </>
            ) : (
              <><p>IGST:</p> <p className="text-right font-semibold">₹{igst.toFixed(2)}</p></>
            )}
            <p className="font-bold text-xl">Grand Total:</p> <p className="text-right font-bold text-xl">₹{grandTotal.toFixed(2)}</p>
          </div>
        </div>

        <button
          onClick={handleGenerateInvoice}
          className="mt-6 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md flex items-center justify-center"
        >
          Generate Invoice
        </button>
      </div>

      {/* Sales History */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-2xl font-semibold text-gray-800">Sales History</h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportData('csv')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <Download className="h-5 w-5 mr-2" /> CSV
            </button>
            <button
              onClick={() => handleExportData('json')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <Download className="h-5 w-5 mr-2" /> JSON
            </button>
            <button
              onClick={() => handleExportData('pdf')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <Download className="h-5 w-5 mr-2" /> PDF
            </button>
            <button
              onClick={() => handleExportData('excel')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <Download className="h-5 w-5 mr-2" /> Excel
            </button>
            <button
              onClick={() => handleExportData('word')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <Download className="h-5 w-5 mr-2" /> Word
            </button>
            <button
              onClick={() => handleExportData('print')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <FileText className="h-5 w-5 mr-2" /> Print
            </button>
          </div>
        </div>
        {salesRecords.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No sales records yet. Add a new sale above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesRecords.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.customerDetails?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.grandTotal.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sale.saleDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {sale.invoiceItems?.map(item => (
                        <div key={item.productId || Math.random()} className="text-xs">
                          {item.productName} (x{item.quantity}) {item.itemInsight && `(${item.itemInsight})`}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Purchases Component
const Purchases = () => {
  const [purchaseRecords, setPurchaseRecords] = useState(getLocalStorageItem('purchaseRecords', []));
  const [vendors, setVendors] = useState(getLocalStorageItem('vendors', []));
  const [newPurchase, setNewPurchase] = useState({ productName: '', quantity: '', price: '', vendorId: '', batchNumber: '', expiryDate: '' });
  const [editingPurchase, setEditingPurchase] = useState(null); // New state for editing
  const [newVendorDetails, setNewVendorDetails] = useState({ name: '', gstin: '', contact: '' });
  const [isAddingNewVendor, setIsAddingNewVendor] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const messageTimeoutRef = useRef(null);

  const showMessage = useCallback((text, type) => {
    setMessage({ text, type });
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setMessage({ text, type });
    }, 5000);
  }, []);

  // Load data from localStorage on component mount
  useEffect(() => {
    setPurchaseRecords(getLocalStorageItem('purchaseRecords', []).sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)));
    setVendors(getLocalStorageItem('vendors', []).sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  // Save data to localStorage whenever relevant state changes
  useEffect(() => {
    setLocalStorageItem('purchaseRecords', purchaseRecords);
  }, [purchaseRecords]);

  useEffect(() => {
    setLocalStorageItem('vendors', vendors);
  }, [vendors]);

  const handleVendorChange = (e) => {
    // If editing, update the editingPurchase object, otherwise update newPurchase
    if (editingPurchase) {
      setEditingPurchase(prev => ({ ...prev, vendorId: e.target.value }));
    } else {
      setNewPurchase({ ...newPurchase, vendorId: e.target.value });
    }

    if (e.target.value === 'addNew') {
      setIsAddingNewVendor(true);
      setNewVendorDetails({ name: '', gstin: '', contact: '' });
    } else {
      setIsAddingNewVendor(false);
    }
  };

  const handleNewVendorInputChange = (e) => {
    const { name, value } = e.target;
    setNewVendorDetails({ ...newVendorDetails, [name]: value });
  };

  const handleAddVendor = () => {
    if (!newVendorDetails.name) {
      showMessage("Vendor name is required.", 'error');
      return;
    }
    const vendorToAdd = {
      id: Date.now().toString(),
      name: newVendorDetails.name,
      gstin: newVendorDetails.gstin,
      contact: newVendorDetails.contact,
    };
    setVendors(prev => [...prev, vendorToAdd].sort((a, b) => a.name.localeCompare(b.name)));
    showMessage("Vendor added successfully!", 'success');
    // Set the newly added vendor as selected for either new purchase or editing
    if (editingPurchase) {
      setEditingPurchase(prev => ({ ...prev, vendorId: vendorToAdd.id }));
    } else {
      setNewPurchase(prev => ({ ...prev, vendorId: vendorToAdd.id }));
    }
    setIsAddingNewVendor(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingPurchase) {
      setEditingPurchase({ ...editingPurchase, [name]: value });
    } else {
      setNewPurchase({ ...newPurchase, [name]: value });
    }
  };

  const handleAddPurchase = () => {
    if (!newPurchase.productName || !newPurchase.quantity || !newPurchase.price || !newPurchase.vendorId || !newPurchase.expiryDate) {
      showMessage("Please fill all required purchase fields (Product, Quantity, Price, Vendor, Expiry Date).", 'error');
      return;
    }
    if (isNaN(newPurchase.quantity) || isNaN(newPurchase.price)) {
      showMessage("Quantity and Price must be numbers.", 'error');
      return;
    }

    let vendorDetailsToSave;
    if (newPurchase.vendorId === 'addNew' && isAddingNewVendor) {
      if (!newVendorDetails.name) {
        showMessage("New vendor name is required.", 'error');
        return;
      }
      const vendorToAdd = {
        id: Date.now().toString(),
        name: newVendorDetails.name,
        gstin: newVendorDetails.gstin,
        contact: newVendorDetails.contact,
      };
      setVendors(prev => [...prev, vendorToAdd].sort((a, b) => a.name.localeCompare(b.name)));
      vendorDetailsToSave = vendorToAdd;
    } else {
      vendorDetailsToSave = vendors.find(v => v.id === newPurchase.vendorId);
    }

    if (!vendorDetailsToSave) {
      showMessage("Invalid vendor selected.", 'error');
      return;
    }

    const purchaseToAdd = {
      id: Date.now().toString(),
      productName: newPurchase.productName,
      quantity: parseInt(newPurchase.quantity, 10),
      price: parseFloat(newPurchase.price),
      vendorId: vendorDetailsToSave.id,
      vendorDetails: vendorDetailsToSave,
      vendorName: vendorDetailsToSave.name, // For easier display
      vendorGSTIN: vendorDetailsToSave.gstin, // For easier display
      vendorContact: vendorDetailsToSave.contact, // For easier display
      batchNumber: newPurchase.batchNumber,
      expiryDate: newPurchase.expiryDate, // Store as ISO-MM-DD string
      purchaseDate: new Date().toISOString(),
    };
    setPurchaseRecords(prev => [...prev, purchaseToAdd].sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)));
    setNewPurchase({ productName: '', quantity: '', price: '', vendorId: '', batchNumber: '', expiryDate: '' });
    setIsAddingNewVendor(false);
    setNewVendorDetails({ name: '', gstin: '', contact: '' });
    showMessage("Purchase record added successfully!", 'success');
  };

  const handleEditClick = (purchase) => {
    setEditingPurchase({ ...purchase });
    // Pre-fill the newPurchase form for editing
    setNewPurchase({
      productName: purchase.productName,
      quantity: purchase.quantity,
      price: purchase.price,
      vendorId: purchase.vendorId,
      batchNumber: purchase.batchNumber,
      expiryDate: purchase.expiryDate,
    });
    setIsAddingNewVendor(false); // Assume existing vendor initially
  };

  const handleUpdatePurchase = () => {
    if (!editingPurchase || !editingPurchase.id) return;
    if (!newPurchase.productName || !newPurchase.quantity || !newPurchase.price || !newPurchase.vendorId || !newPurchase.expiryDate) {
      showMessage("Please fill all required purchase fields for update.", 'error');
      return;
    }
    if (isNaN(newPurchase.quantity) || isNaN(newPurchase.price)) {
      showMessage("Quantity and Price must be numbers.", 'error');
      return;
    }

    let vendorDetailsToSave = vendors.find(v => v.id === newPurchase.vendorId);
    if (newPurchase.vendorId === 'addNew' && isAddingNewVendor) {
      if (!newVendorDetails.name) {
        showMessage("New vendor name is required.", 'error');
        return;
      }
      const vendorToAdd = {
        id: Date.now().toString(),
        name: newVendorDetails.name,
        gstin: newVendorDetails.gstin,
        contact: newVendorDetails.contact,
      };
      setVendors(prev => [...prev, vendorToAdd].sort((a, b) => a.name.localeCompare(b.name)));
      vendorDetailsToSave = vendorToAdd;
    } else if (!vendorDetailsToSave) {
      showMessage("Invalid vendor selected.", 'error');
      return;
    }

    const updatedPurchase = {
      ...editingPurchase,
      productName: newPurchase.productName,
      quantity: parseInt(newPurchase.quantity, 10),
      price: parseFloat(newPurchase.price),
      vendorId: vendorDetailsToSave.id,
      vendorDetails: vendorDetailsToSave,
      vendorName: vendorDetailsToSave.name,
      vendorGSTIN: vendorDetailsToSave.gstin,
      vendorContact: vendorDetailsToSave.contact,
      batchNumber: newPurchase.batchNumber,
      expiryDate: newPurchase.expiryDate,
      updatedAt: new Date().toISOString(),
    };

    setPurchaseRecords(prev => prev.map(p =>
      p.id === updatedPurchase.id ? updatedPurchase : p
    ).sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)));

    setEditingPurchase(null); // Exit edit mode
    setNewPurchase({ productName: '', quantity: '', price: '', vendorId: '', batchNumber: '', expiryDate: '' }); // Clear form
    setIsAddingNewVendor(false);
    setNewVendorDetails({ name: '', gstin: '', contact: '' });
    showMessage("Purchase record updated successfully!", 'success');
  };

  const handleCancelEdit = () => {
    setEditingPurchase(null);
    setNewPurchase({ productName: '', quantity: '', price: '', vendorId: '', batchNumber: '', expiryDate: '' }); // Clear form
    setIsAddingNewVendor(false);
    setNewVendorDetails({ name: '', gstin: '', contact: '' });
  };


  const handleExportData = (format) => {
    // Access XLSX and docx from the global window object
    const XLSX = window.XLSX;
    const { Document, Packer, Paragraph, TextRun } = window.docx;

    if (purchaseRecords.length === 0) {
      showMessage("No data to export.", 'error');
      return;
    }
    let content = '';
    let filename = `pharma_purchases.${format}`;
    let mimeType = '';

    switch (format) {
      case 'csv':
        const csvHeader = ["ID", "Product Name", "Quantity", "Price", "Vendor Name", "Vendor GSTIN", "Vendor Contact", "Batch No.", "Expiry Date", "Purchase Date"].join(',');
        const csvRows = purchaseRecords.map(p =>
          [
            `"${p.id}"`,
            `"${p.productName.replace(/"/g, '""')}"`,
            p.quantity,
            p.price,
            `"${p.vendorName.replace(/"/g, '""')}"`,
            `"${p.vendorGSTIN || ''}"`,
            `"${p.vendorContact || ''}"`,
            `"${p.batchNumber || ''}"`,
            `"${p.expiryDate || ''}"`,
            p.purchaseDate || ''
          ].join(',')
        );
        content = [csvHeader, ...csvRows].join('\n');
        mimeType = 'text/plain;charset=utf-8;'; // Changed to text/plain
        filename = `pharma_purchases.txt`; // Save as .txt
        break;
      case 'json':
        content = JSON.stringify(purchaseRecords, null, 2);
        mimeType = 'application/json;charset=utf-8;';
        filename = `pharma_purchases.txt`; // Save as .txt
        break;
      case 'pdf':
        try {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          doc.text("Purchase List", 10, 10);
          let y = 20;
          purchaseRecords.forEach(p => {
            doc.text(`${p.productName} - Qty: ${p.quantity}, Price: ${p.price}, Vendor: ${p.vendorName}`, 10, y);
            y += 10;
          });
          doc.save("pharma_purchases.pdf");
          showMessage(`PDF for purchases generated and downloaded! (Library Used)`, 'success');
        } catch (e) {
          console.error("Error generating PDF:", e);
          showMessage(`Error generating PDF for purchases (ensure library is loaded).`, 'error');
        }
        return;
      case 'excel':
        try {
          const ws = XLSX.utils.json_to_sheet(purchaseRecords);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Purchases");
          XLSX.writeFile(wb, "pharma_purchases.xlsx");
          showMessage(`Excel for purchases generated and downloaded! (Library Used)`, 'success');
        } catch (e) {
          console.error("Error generating Excel:", e);
          showMessage(`Error generating Excel for purchases (ensure library is loaded).`, 'error');
        }
        return;
      case 'word':
        try {
          const doc = new Document({
            sections: [{
              properties: {},
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Pharma Purchase List",
                      bold: true,
                      size: 32, // 16pt
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Generated on: ${new Date().toLocaleDateString()}`,
                      size: 20, // 10pt
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "\nPurchases:\n",
                      bold: true,
                    }),
                  ],
                }),
                ...purchaseRecords.map(p => new Paragraph({
                  children: [
                    new TextRun(`${p.productName} (Qty: ${p.quantity}, Price: ₹${p.price}, Vendor: ${p.vendorName})`),
                  ],
                })),
              ],
            }],
          });

          Packer.toBlob(doc).then(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'pharma_purchases.docx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showMessage(`Word document for purchases generated and downloaded! (Library Used)`, 'success');
          }).catch(e => {
            console.error("Error generating Word document:", e);
            showMessage(`Error generating Word document for purchases.`, 'error');
          });
        } catch (e) {
          console.error("Error setting up Word document generation:", e);
          showMessage(`Error setting up Word document generation for purchases.`, 'error');
        }
        return;
      case 'print':
        showMessage(`Opening print dialog for purchases.`, 'success');
        window.print();
        return;
      default:
        showMessage("Unsupported export format.", 'error');
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showMessage(`Purchase data exported successfully as ${format.toUpperCase()}!`, 'success');
    } else {
      showMessage("Your browser does not support downloading files directly. Please copy the data manually.", 'error');
      console.log(content);
    }
  };

  // Simple Inventory Manager overview
  const inventorySummary = purchaseRecords.reduce((acc, record) => {
    acc[record.productName] = (acc[record.productName] || 0) + record.quantity;
    return acc;
  }, {});

  const expiringProducts = purchaseRecords.filter(p => {
    if (!p.expiryDate) return false;
    const expiry = new Date(p.expiryDate);
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(now.getMonth() + 3);
    return expiry > now && expiry < threeMonthsFromNow;
  }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));


  return (
    <div className="p-4">
      <h3 className="text-3xl font-bold text-gray-800 mb-6">Purchase Management & Inventory</h3>

      {message.text && (
        <div className={`p-4 mb-4 rounded-lg text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} transition-opacity duration-300 ease-in-out`}>
          {message.text}
        </div>
      )}

      {/* Vendor Selection / Add New */}
      <div className="bg-red-50 p-6 rounded-xl shadow-inner mb-8 border border-red-200">
        <h4 className="text-2xl font-semibold text-red-800 mb-4 flex items-center">
          <Users className="h-6 w-6 mr-2" /> Vendor Details (Sundry Creditor)
        </h4>
        <div className="mb-4">
          <label htmlFor="vendorSelect" className="block text-gray-700 text-sm font-bold mb-2">Select Existing Vendor:</label>
          <select
            id="vendorSelect"
            value={editingPurchase ? editingPurchase.vendorId : newPurchase.vendorId}
            onChange={handleVendorChange}
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-red-400 transition-all duration-200"
          >
            <option value="">-- Select Vendor --</option>
            {vendors.map(vendor => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name} ({vendor.gstin || 'N/A'})
              </option>
            ))}
            <option value="addNew">-- Add New Vendor --</option>
          </select>
        </div>

        {isAddingNewVendor && (
          <div className="mt-4 p-4 bg-red-100 rounded-lg border border-red-300">
            <h5 className="text-xl font-semibold text-red-700 mb-3">Add New Vendor:</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Vendor Name"
                value={newVendorDetails.name}
                onChange={handleNewVendorInputChange}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400"
              />
              <input
                type="text"
                name="gstin"
                placeholder="GSTIN (Optional)"
                value={newVendorDetails.gstin}
                onChange={handleNewVendorInputChange}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400"
              />
              <input
                type="text"
                name="contact"
                placeholder="Contact (Optional)"
                value={newVendorDetails.contact}
                onChange={handleNewVendorInputChange}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400"
              />
            </div>
            <button
              onClick={handleAddVendor}
              className="mt-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md"
            >
              Save New Vendor
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Purchase Form */}
      <div className="bg-red-50 p-6 rounded-xl shadow-inner mb-8 border border-red-200">
        <h4 className="text-2xl font-semibold text-red-800 mb-4">{editingPurchase ? 'Edit Purchase' : 'Add New Purchase'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            name="productName"
            placeholder="Product Name"
            value={editingPurchase ? editingPurchase.productName : newPurchase.productName}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200"
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={editingPurchase ? editingPurchase.quantity : newPurchase.quantity}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200"
          />
          <input
            type="number"
            name="price"
            placeholder="Price per unit"
            value={editingPurchase ? editingPurchase.price : newPurchase.price}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200"
          />
          <input
            type="text"
            name="batchNumber"
            placeholder="Batch Number (Optional)"
            value={editingPurchase ? editingPurchase.batchNumber : newPurchase.batchNumber}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200"
          />
          <input
            type="date"
            name="expiryDate"
            placeholder="Expiry Date"
            value={editingPurchase ? editingPurchase.expiryDate : newPurchase.expiryDate}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div className="flex gap-4">
          {editingPurchase ? (
            <>
              <button
                onClick={handleUpdatePurchase}
                className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md flex items-center justify-center"
              >
                Update Purchase
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md flex items-center justify-center"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleAddPurchase}
              className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md flex items-center justify-center"
            >
              Add Purchase Record
            </button>
          )}
        </div>
      </div>

      {/* Inventory Manager */}
      <div className="bg-blue-50 p-6 rounded-xl shadow-inner mb-8 border border-blue-200">
        <h4 className="text-2xl font-semibold text-blue-800 mb-4">Inventory Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-xl font-semibold text-gray-700 mb-2">Current Stock:</h5>
            {Object.keys(inventorySummary).length === 0 ? (
              <p className="text-gray-600">No stock recorded yet.</p>
            ) : (
              <ul className="list-disc list-inside text-gray-600">
                {Object.entries(inventorySummary).map(([product, quantity]) => (
                  <li key={product}>{product}: {quantity} units</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h5 className="text-xl font-semibold text-gray-700 mb-2">Expiring Soon (Next 3 Months):</h5>
            {expiringProducts.length === 0 ? (
              <p className="text-gray-600">No products expiring soon.</p>
            ) : (
              <ul className="list-disc list-inside text-gray-600">
                {expiringProducts.map((p) => (
                  <li key={p.id}>{p.productName} (Batch: {p.batchNumber || 'N/A'}) - Expires: {new Date(p.expiryDate).toLocaleDateString()}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-2xl font-semibold text-gray-800">Purchase History</h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportData('csv')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <Download className="h-5 w-5 mr-2" /> CSV
            </button>
            <button
              onClick={() => handleExportData('json')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <Download className="h-5 w-5 mr-2" /> JSON
            </button>
            <button
              onClick={() => handleExportData('pdf')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <Download className="h-5 w-5 mr-2" /> PDF
            </button>
            <button
              onClick={() => handleExportData('excel')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <Download className="h-5 w-5 mr-2" /> Excel
            </button>
            <button
              onClick={() => handleExportData('word')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <Download className="h-5 w-5 mr-2" /> Word
            </button>
            <button
              onClick={() => handleExportData('print')}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md flex items-center"
            >
              <FileText className="h-5 w-5 mr-2" /> Print
            </button>
          </div>
        </div>
        {purchaseRecords.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No purchase records yet. Add a new purchase above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchaseRecords.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{purchase.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.vendorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.batchNumber || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.expiryDate ? new Date(purchase.expiryDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(purchase)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const Reports = ({ onlineStatus }) => {
  const [message, setMessage] = useState({ text: '', type: '' });
  const messageTimeoutRef = useRef(null);
  const [salesRecords, setSalesRecords] = useState(getLocalStorageItem('salesRecords', []));
  const [purchaseRecords, setPurchaseRecords] = useState(getLocalStorageItem('purchaseRecords', []));
  const [aiReportInsight, setAiReportInsight] = useState('');
  const [aiLoadingReport, setAiLoadingReport] = useState(false);


  const showMessage = useCallback((text, type) => {
    setMessage({ text, type });
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setMessage({ text, type });
    }, 5000);
  }, []);

  // Load data from localStorage on component mount
  useEffect(() => {
    setSalesRecords(getLocalStorageItem('salesRecords', []));
    setPurchaseRecords(getLocalStorageItem('purchaseRecords', []));
  }, []);

  const handleExportData = (format, reportType) => {
    // Access jsPDF, XLSX and docx from the global window object
    const { jsPDF } = window.jspdf;
    const XLSX = window.XLSX;
    const { Document, Packer, Paragraph, TextRun } = window.docx;

    let dataToExport = [];
    let filenamePrefix = '';

    if (reportType === 'sales') {
      dataToExport = salesRecords;
      filenamePrefix = 'sales_report';
    } else if (reportType === 'purchases') {
      dataToExport = purchaseRecords;
      filenamePrefix = 'purchases_report';
    } else if (reportType === 'inventory') {
      const inventorySummary = purchaseRecords.reduce((acc, record) => {
        acc[record.productName] = (acc[record.productName] || 0) + record.quantity;
        return acc;
      }, {});
      dataToExport = Object.entries(inventorySummary).map(([productName, quantity]) => ({ productName, quantity }));
      filenamePrefix = 'inventory_report';
    } else if (reportType === 'expiring') {
      const expiringProducts = purchaseRecords.filter(p => {
        if (!p.expiryDate) return false;
        const expiry = new Date(p.expiryDate);
        const now = new Date();
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(now.getMonth() + 3);
        return expiry > now && expiry < threeMonthsFromNow;
      }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
      dataToExport = expiringProducts;
      filenamePrefix = 'expiring_products_report';
    }

    if (dataToExport.length === 0) {
      showMessage(`No data to export for ${reportType} report.`, 'error');
      return;
    }

    let content = '';
    let filename = `${filenamePrefix}.${format}`;
    let mimeType = '';

    switch (format) {
      case 'csv':
        const headers = Object.keys(dataToExport[0]).join(',');
        const rows = dataToExport.map(row => Object.values(row).map(value => `"${String(value).replace(/"/g, '""')}"`).join(','));
        content = [headers, ...rows].join('\n');
        mimeType = 'text/plain;charset=utf-8;'; // Changed to text/plain
        filename = `${filenamePrefix}.txt`; // Save as .txt
        break;
      case 'json':
        content = JSON.stringify(dataToExport, null, 2);
        mimeType = 'application/json;charset=utf-8;';
        filename = `${filenamePrefix}.txt`; // Save as .txt
        break;
      case 'pdf':
        try {
          const doc = new jsPDF();
          doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, 10, 10);
          let y = 20;
          dataToExport.forEach(item => {
            doc.text(JSON.stringify(item), 10, y);
            y += 7;
          });
          doc.save(`${filenamePrefix}.pdf`);
          showMessage(`PDF for ${reportType} report generated and downloaded! (Library Used)`, 'success');
        } catch (e) {
          console.error("Error generating PDF:", e);
          showMessage(`Error generating PDF for ${reportType} report (ensure library is loaded).`, 'error');
        }
        return;
      case 'excel':
        try {
          const ws = XLSX.utils.json_to_sheet(dataToExport);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`);
          XLSX.writeFile(wb, `${filenamePrefix}.xlsx`);
          showMessage(`Excel for ${reportType} report generated and downloaded! (Library Used)`, 'success');
        } catch (e) {
          console.error("Error generating Excel:", e);
          showMessage(`Error generating Excel for ${reportType} report (ensure library is loaded).`, 'error');
        }
        return;
      case 'word':
        try {
          const doc = new Document({
            sections: [{
              properties: {},
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
                      bold: true,
                      size: 32, // 16pt
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Generated on: ${new Date().toLocaleDateString()}`,
                      size: 20, // 10pt
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `\n${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Records:\n`,
                      bold: true,
                    }),
                  ],
                }),
                ...dataToExport.map(item => new Paragraph({
                  children: [
                    new TextRun(JSON.stringify(item)),
                  ],
                })),
              ],
            }],
          });

          Packer.toBlob(doc).then(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filenamePrefix}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showMessage(`Word document for ${reportType} report generated and downloaded! (Library Used)`, 'success');
          }).catch(e => {
            console.error("Error generating Word document:", e);
            showMessage(`Error generating Word document for ${reportType} report.`, 'error');
          });
        } catch (e) {
          console.error("Error setting up Word document generation:", e);
          showMessage(`Error setting up Word document generation for ${reportType} report.`, 'error');
        }
        return;
      case 'print':
        showMessage(`Opening print dialog for ${reportType} report.`, 'success');
        console.log(`Simulated print for ${reportType} report:`, dataToExport);
        window.print();
        return;
      default:
        showMessage("Unsupported export format.", 'error');
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showMessage(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report exported successfully as ${format.toUpperCase()}!`, 'success');
    } else {
      showMessage("Your browser does not support downloading files directly. Please copy the data manually.", 'error');
      console.log(content);
    }
  };

  const getSalesSummary = () => {
    const summary = salesRecords.reduce((acc, sale) => {
      const date = new Date(sale.saleDate).toLocaleDateString();
      acc[date] = (acc[date] || 0) + sale.grandTotal;
      return acc;
    }, {});
    return Object.entries(summary).map(([date, total]) => ({ date, total }));
  };

  const getPurchaseSummary = () => {
    const summary = purchaseRecords.reduce((acc, purchase) => {
      const date = new Date(purchase.purchaseDate).toLocaleDateString();
      acc[date] = (acc[date] || 0) + (purchase.quantity * purchase.price);
      return acc;
    }, {});
    return Object.entries(summary).map(([date, total]) => ({ date, total }));
  };

  const getExpiringProductsSummary = () => {
    const expiring = purchaseRecords.filter(p => {
      if (!p.expiryDate) return false;
      const expiry = new Date(p.expiryDate);
      const now = new Date();
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(now.getMonth() + 3);
      return expiry > now && expiry < threeMonthsFromNow;
    }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    return expiring.map(p => ({
      productName: p.productName,
      batchNumber: p.batchNumber,
      expiryDate: new Date(p.expiryDate).toLocaleDateString(),
      quantity: p.quantity
    }));
  };

  const handleGetReportInsights = async (reportType) => {
    if (!onlineStatus) {
      showMessage("AI features require an internet connection.", "error");
      return;
    }
    setAiLoadingReport(true);
    setAiReportInsight('');
    let dataSummary = '';

    if (reportType === 'sales') {
      const summary = getSalesSummary();
      dataSummary = summary.length > 0 ? `Sales data: ${JSON.stringify(summary)}` : 'No sales data.';
    } else if (reportType === 'purchases') {
      const summary = getPurchaseSummary();
      dataSummary = summary.length > 0 ? `Purchase data: ${JSON.stringify(summary)}` : 'No purchase data.';
    } else if (reportType === 'inventory') {
      const summary = getExpiringProductsSummary(); // Using expiring products for inventory insight for now
      dataSummary = summary.length > 0 ? `Inventory data (expiring products): ${JSON.stringify(summary)}` : 'No inventory data.';
    } else if (reportType === 'expiring') {
      const summary = getExpiringProductsSummary();
      dataSummary = summary.length > 0 ? `Expiring products: ${JSON.stringify(summary)}` : 'No expiring products.';
    } else {
      dataSummary = 'No specific report data selected.';
    }

    try {
      const prompt = `Analyze the following ERP report data and provide key observations, trends, and actionable insights in a concise paragraph. Data: ${dataSummary}`;
      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      let insight = 'No insights generated.';
      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
        insight = result.candidates[0].content.parts[0].text;
      }
      setAiReportInsight(insight);
      showMessage("AI report insights generated!", 'success');
    } catch (error) {
      console.error("Error getting report insights:", error);
      setAiReportInsight('Error generating insights.');
      showMessage("Error generating report insights.", 'error');
    } finally {
      setAiLoadingReport(false);
    }
  };


  return (
    <div className="p-4">
      <h3 className="text-3xl font-bold text-gray-800 mb-6">Reports & Analytics</h3>

      {message.text && (
        <div className={`p-4 mb-4 rounded-lg text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} transition-opacity duration-300 ease-in-out`}>
          {message.text}
        </div>
      )}

      <p className="text-lg text-gray-600 mb-8">
        Generate detailed reports on sales, purchases, inventory, and financial performance.
      </p>

      {/* Sales Reports */}
      <div className="bg-blue-50 p-6 rounded-xl shadow-inner mb-8 border border-blue-200">
        <h4 className="text-2xl font-semibold text-blue-800 mb-4">Sales Reports</h4>
        <div className="flex flex-wrap gap-4 mb-4">
          <button onClick={() => handleExportData('csv', 'sales')} className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md flex items-center">
            <Download className="h-5 w-5 mr-2" /> Export Sales CSV
          </button>
          <button onClick={() => handleExportData('pdf', 'sales')} className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md flex items-center">
            <Download className="h-5 w-5 mr-2" /> Export Sales PDF
          </button>
          <button onClick={() => handleExportData('print', 'sales')} className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md flex items-center">
            <FileText className="h-5 w-5 mr-2" /> Print Sales Report
          </button>
          <button
            onClick={() => handleGetReportInsights('sales')}
            disabled={aiLoadingReport || salesRecords.length === 0 || !onlineStatus}
            className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Get AI Sales Insights (Requires Internet)"
          >
            {aiLoadingReport ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Getting Insights...
              </span>
            ) : (
              <><Sparkles className="h-5 w-5 mr-2" /> Get AI Sales Insights</>
            )}
          </button>
        </div>
        <h5 className="text-xl font-semibold text-gray-700 mb-2">Daily Sales Summary:</h5>
        {getSalesSummary().length === 0 ? (
          <p className="text-gray-600">No sales data available for summary.</p>
        ) : (
          <ul className="list-disc list-inside text-gray-600">
            {getSalesSummary().map((item, index) => (
              <li key={index}>{item.date}: ₹{item.total.toFixed(2)}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Purchase Reports */}
      <div className="bg-red-50 p-6 rounded-xl shadow-inner mb-8 border border-red-200">
        <h4 className="text-2xl font-semibold text-red-800 mb-4">Purchase Reports</h4>
        <div className="flex flex-wrap gap-4 mb-4">
          <button onClick={() => handleExportData('csv', 'purchases')} className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md flex items-center">
            <Download className="h-5 w-5 mr-2" /> Export Purchases CSV
          </button>
          <button onClick={() => handleExportData('pdf', 'purchases')} className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md flex items-center">
            <Download className="h-5 w-5 mr-2" /> Export Purchases PDF
          </button>
          <button onClick={() => handleExportData('print', 'purchases')} className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md flex items-center">
            <FileText className="h-5 w-5 mr-2" /> Print Purchases Report
          </button>
          <button
            onClick={() => handleGetReportInsights('purchases')}
            disabled={aiLoadingReport || purchaseRecords.length === 0 || !onlineStatus}
            className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Get AI Purchase Insights (Requires Internet)"
          >
            {aiLoadingReport ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Getting Insights...
              </span>
            ) : (
              <><Sparkles className="h-5 w-5 mr-2" /> Get AI Purchase Insights</>
            )}
          </button>
        </div>
        <h5 className="text-xl font-semibold text-gray-700 mb-2">Daily Purchase Summary:</h5>
        {getPurchaseSummary().length === 0 ? (
          <p className="text-gray-600">No purchase data available for summary.</p>
        ) : (
          <ul className="list-disc list-inside text-gray-600">
            {getPurchaseSummary().map((item, index) => (
              <li key={index}>{item.date}: ₹{item.total.toFixed(2)}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Inventory Reports */}
      <div className="bg-purple-50 p-6 rounded-xl shadow-inner mb-8 border border-purple-200">
        <h4 className="text-2xl font-semibold text-purple-800 mb-4">Inventory Reports</h4>
        <div className="flex flex-wrap gap-4 mb-4">
          <button onClick={() => handleExportData('csv', 'inventory')} className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md flex items-center">
            <Download className="h-5 w-5 mr-2" /> Export Inventory CSV
          </button>
          <button onClick={() => handleExportData('csv', 'expiring')} className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md flex items-center">
            <Download className="h-5 w-5 mr-2" /> Export Expiring CSV
          </button>
          <button
            onClick={() => handleGetReportInsights('expiring')}
            disabled={aiLoadingReport || getExpiringProductsSummary().length === 0 || !onlineStatus}
            className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Get AI Expiring Insights (Requires Internet)"
          >
            {aiLoadingReport ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Getting Insights...
              </span>
            ) : (
              <><Sparkles className="h-5 w-5 mr-2" /> Get AI Expiring Insights</>
            )}
          </button>
        </div>
        <h5 className="text-xl font-semibold text-gray-700 mb-2">Expiring Products Summary (Next 3 Months):</h5>
        {getExpiringProductsSummary().length === 0 ? (
          <p className="text-gray-600">No products expiring soon.</p>
        ) : (
          <ul className="list-disc list-inside text-gray-600">
            {getExpiringProductsSummary().map((item, index) => (
              <li key={index}>{item.productName} (Batch: {item.batchNumber || 'N/A'}) - Expires: {item.expiryDate} (Qty: {item.quantity})</li>
            ))}
          </ul>
        )}
      </div>

      {aiReportInsight && (
        <div className="mt-8 p-6 bg-green-100 rounded-xl border border-green-300">
          <h4 className="text-2xl font-semibold text-green-800 mb-4 flex items-center">
            <Sparkles className="h-6 w-6 mr-2" /> AI Report Insights
          </h4>
          <p className="text-gray-700">{aiReportInsight}</p>
        </div>
      )}

      <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg shadow-inner">
        <p className="text-yellow-700">More detailed report generation and visualization features will be added here.</p>
      </div>
    </div>
  );
};

const CompanyProfile = ({ setCompanyProfileImage, setCompanyProfileName, setCompanyProfileAddress, setCompanyProfileGSTIN }) => {
  const [companyName, setCompanyName] = useState(getLocalStorageItem('companyProfile_name', 'My Pharma Inc.'));
  const [address, setAddress] = useState(getLocalStorageItem('companyProfile_address', '123 Pharma Lane, Health City'));
  const [phone, setPhone] = useState(getLocalStorageItem('companyProfile_phone', '+123 456 7890'));
  const [email, setEmail] = useState(getLocalStorageItem('companyProfile_email', 'info@mypharma.com'));
  const [gstin, setGstin] = useState(getLocalStorageItem('companyProfile_gstin', ''));
  const [license, setLicense] = useState(getLocalStorageItem('companyProfile_license', ''));
  const [imagePreview, setImagePreview] = useState(getLocalStorageItem('companyProfile_image', ''));
  const [isEditing, setIsEditing] = useState(false);
  const [sloganInput, setSloganInput] = useState(getLocalStorageItem('companyProfile_sloganInput', ''));
  const [sloganResult, setSloganResult] = useState(getLocalStorageItem('companyProfile_sloganResult', ''));
  const [aiLoadingSlogan, setAiLoadingSlogan] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const messageTimeoutRef = useRef(null);

  const showMessage = useCallback((text, type) => {
    setMessage({ text, type });
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setMessage({ text, type });
    }, 5000);
  }, []);

  // Update parent state for header display
  useEffect(() => {
    setCompanyProfileImage(imagePreview);
  }, [imagePreview, setCompanyProfileImage]);

  useEffect(() => {
    setCompanyProfileName(companyName);
  }, [companyName, setCompanyProfileName]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setLocalStorageItem('companyProfile_name', companyName);
    setLocalStorageItem('companyProfile_address', address);
    setLocalStorageItem('companyProfile_phone', phone);
    setLocalStorageItem('companyProfile_email', email);
    setLocalStorageItem('companyProfile_gstin', gstin);
    setLocalStorageItem('companyProfile_license', license);
    setLocalStorageItem('companyProfile_image', imagePreview);
    setLocalStorageItem('companyProfile_sloganInput', sloganInput);
    setLocalStorageItem('companyProfile_sloganResult', sloganResult);
    
    // Update parent state as well
    setCompanyProfileName(companyName);
    setCompanyProfileImage(imagePreview);
    setCompanyProfileAddress(address); // Used here
    setCompanyProfileGSTIN(gstin);     // Used here

    console.log("Saving company profile:", { companyName, address, phone, email, gstin, license, imagePreview, sloganInput, sloganResult });
    setIsEditing(false);
  };

  const handleGenerateSlogan = async () => {
    if (!navigator.onLine) {
      showMessage("AI features require an internet connection.", "error");
      return;
    }
    if (!companyName.trim()) {
      showMessage("Please enter a company name to generate a slogan.", 'error');
      return;
    }

    setAiLoadingSlogan(true);
    setSloganResult('');
    try {
      let chatHistory = [];
      const prompt = `Generate a catchy and professional marketing slogan for a pharmaceutical company named "${companyName}". Focus on trust, health, and innovation. Keep it under 15 words.`;
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will provide this at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setSloganResult(text);
        showMessage("AI slogan generated!", 'success');
      } else {
        setSloganResult('Could not generate slogan. Try again.');
        showMessage("AI slogan generation failed.", 'error');
      }
    } catch (error) {
      console.error("Error calling AI for slogan:", error);
      setSloganResult('Error during AI slogan generation.');
      showMessage("Error calling AI for slogan: " + error.message, 'error');
    } finally {
      setAiLoadingSlogan(false);
    }
  };


  return (
    <div className="p-4">
      <h3 className="text-3xl font-bold text-gray-800 mb-6">Company Profile</h3>
      {message.text && (
        <div className={`p-4 mb-4 rounded-lg text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} transition-opacity duration-300 ease-in-out`}>
          {message.text}
        </div>
      )}
      <div className="bg-blue-50 p-6 rounded-xl shadow-inner mb-8 border border-blue-200">
        <h4 className="text-2xl font-semibold text-blue-800 mb-4">Your Business Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Company Name:</label>
            {isEditing ? (
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <p className="p-3 bg-white border border-gray-200 rounded-lg">{companyName}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Address:</label>
            {isEditing ? (
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <p className="p-3 bg-white border border-gray-200 rounded-lg">{address}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Phone:</label>
            {isEditing ? (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <p className="p-3 bg-white border border-gray-200 rounded-lg">{phone}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            {isEditing ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <p className="p-3 bg-white border border-gray-200 rounded-lg">{email}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">GSTIN:</label>
            {isEditing ? (
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <p className="p-3 bg-white border border-gray-200 rounded-lg">{gstin || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">License Number:</label>
            {isEditing ? (
              <input
                type="text"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <p className="p-3 bg-white border border-gray-200 rounded-lg">{license || 'N/A'}</p>
            )}
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Company Image:</label>
          {isEditing ? (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {imagePreview && (
                <img src={imagePreview} alt="Company Preview" className="mt-4 h-24 w-24 object-cover rounded-full border-2 border-gray-300" />
              )}
            </>
          ) : (
            imagePreview ? (
              <img src={imagePreview} alt="Company" className="mt-4 h-24 w-24 object-cover rounded-full border-2 border-gray-300" />
            ) : (
              <p className="p-3 bg-white border border-gray-200 rounded-lg">No image uploaded.</p>
            )
          )}
        </div>
        <div className="mt-6">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md mr-4"
            >
              Save Changes
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* AI Slogan Generator */}
      <div className="bg-purple-50 p-6 rounded-xl shadow-inner mb-8 border border-purple-200">
        <h4 className="text-2xl font-semibold text-purple-800 mb-4 flex items-center">
          <Bot className="h-6 w-6 mr-2" /> AI Slogan Generator
        </h4>
        <p className="text-purple-700 mb-4">
          Generate a marketing slogan for your company.
        </p>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Briefly describe your company (e.g., 'trustworthy, innovative')"
            value={sloganInput}
            onChange={(e) => setSloganInput(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
          />
          <button
            onClick={handleGenerateSlogan}
            disabled={aiLoadingSlogan || !sloganInput.trim() || !navigator.onLine}
            className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Generate Slogan with AI (Requires Internet)"
          >
            {aiLoadingSlogan ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
                Generating...
              </span>
            ) : (
              'Generate Slogan'
            )}
          </button>
        </div>
        {sloganResult && (
          <p className="text-lg text-purple-800 font-semibold mt-4">
            Generated Slogan: <span className="text-purple-900">{sloganResult}</span>
          </p>
        )}
      </div>
    </div>
  );
};

// Settings Component
const SettingsComponent = ({
  primaryColor, setPrimaryColor,
  secondaryColor, setSecondaryColor,
  textColor, setTextColor,
  fontSize, setFontSize,
  fontFamily, setFontFamily,
  keyboardMode, setKeyboardMode,
  shortcuts, setShortcuts,
  onlineStatus
}) => {
  const [message, setMessage] = useState({ text: '', type: '' });
  const messageTimeoutRef = useRef(null);

  // Function to display messages
  const showMessage = useCallback((text, type) => {
    setMessage({ text, type });
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 5000);
  }, []);

  // Save settings to localStorage on change
  useEffect(() => {
    setLocalStorageItem('primaryColor', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    setLocalStorageItem('secondaryColor', secondaryColor);
  }, [secondaryColor]);

  useEffect(() => {
    setLocalStorageItem('textColor', textColor);
  }, [textColor]);

  useEffect(() => {
    setLocalStorageItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    setLocalStorageItem('fontFamily', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    setLocalStorageItem('keyboardMode', keyboardMode);
  }, [keyboardMode]);

  useEffect(() => {
    setLocalStorageItem('keyboardShortcuts', shortcuts);
  }, [shortcuts]);

  // Handle shortcut updates
  const handleShortcutChange = (key, field, value) => {
    setShortcuts(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to clear ALL application data? This action cannot be undone.")) {
      localStorage.clear();
      // Reload the page to reset all states
      window.location.reload();
      showMessage("All data cleared successfully!", 'success');
    }
  };

  const handleExportAllData = () => {
    const allData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        allData[key] = JSON.parse(localStorage.getItem(key));
      } catch (e) {
        allData[key] = localStorage.getItem(key);
      }
    }
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pharma_erp_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showMessage("All application data exported successfully!", 'success');
  };

  const handleImportAllData = (event) => {
    const file = event.target.files[0];
    if (!file) {
      showMessage("No file selected.", 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (window.confirm("Are you sure you want to import this data? This will overwrite existing data.")) {
          // Clear current localStorage before importing
          localStorage.clear();
          for (const key in importedData) {
            // Re-stringify complex objects/arrays to ensure consistency with getLocalStorageItem
            setLocalStorageItem(key, importedData[key]);
          }
          showMessage("Data imported successfully! Reloading application...", 'success');
          // Reload to apply imported settings and data
          window.location.reload();
        }
      } catch (error) {
        console.error("Error importing data:", error);
        showMessage("Failed to import data. Please ensure it's a valid JSON file.", 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4">
      <h3 className="text-3xl font-bold text-gray-800 mb-6">Application Settings</h3>

      {message.text && (
        <div className={`p-4 mb-4 rounded-lg text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} transition-opacity duration-300 ease-in-out`}>
          {message.text}
        </div>
      )}

      {/* Theme Customization */}
      <div className="bg-green-50 p-6 rounded-xl shadow-inner mb-8 border border-green-200">
        <h4 className="text-2xl font-semibold text-green-800 mb-4">Theme Customization</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="primaryColor" className="block text-gray-700 text-sm font-bold mb-2">Primary Color:</label>
            <input
              type="color"
              id="primaryColor"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label htmlFor="secondaryColor" className="block text-gray-700 text-sm font-bold mb-2">Secondary Color:</label>
            <input
              type="color"
              id="secondaryColor"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label htmlFor="textColor" className="block text-gray-700 text-sm font-bold mb-2">Text Color:</label>
            <input
              type="color"
              id="textColor"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label htmlFor="fontSize" className="block text-gray-700 text-sm font-bold mb-2">Font Size (px):</label>
            <input
              type="number"
              id="fontSize"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value) || 16)}
              min="10"
              max="24"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div className="col-span-full">
            <label htmlFor="fontFamily" className="block text-gray-700 text-sm font-bold mb-2">Font Family:</label>
            <select
              id="fontFamily"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-400"
            >
              <option value="Inter">Inter (Default)</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Source Sans Pro">Source Sans Pro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Keyboard Accessibility */}
      <div className="bg-yellow-50 p-6 rounded-xl shadow-inner mb-8 border border-yellow-200">
        <h4 className="text-2xl font-semibold text-yellow-800 mb-4 flex items-center">
          <Keyboard className="h-6 w-6 mr-2" /> Keyboard Accessibility
        </h4>
        <div className="mb-4">
          <label htmlFor="keyboardMode" className="block text-gray-700 text-sm font-bold mb-2">Keyboard Mode:</label>
          <select
            id="keyboardMode"
            value={keyboardMode}
            onChange={(e) => setKeyboardMode(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-400"
          >
            <option value="mouse-keyboard">Mouse + Keyboard (Alt Key required for shortcuts)</option>
            <option value="full-keyboard">Full Keyboard (Shortcuts without Alt Key)</option>
          </select>
          <p className="text-sm text-gray-600 mt-2">
            In "Full Keyboard" mode, direct key presses (e.g., '1', '2') will trigger shortcuts. Use with caution to avoid conflicts with input fields.
          </p>
        </div>

        <h5 className="text-xl font-semibold text-yellow-800 mb-3">Custom Keyboard Shortcuts:</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(shortcuts).map(([key, { action, tab, target }]) => (
            <div key={key} className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
              <p className="font-bold text-yellow-800 mb-2">Shortcut: {key}</p>
              <div className="mb-2">
                <label className="block text-gray-700 text-xs font-bold mb-1">Action:</label>
                <input
                  type="text"
                  value={action}
                  onChange={(e) => handleShortcutChange(key, 'action', e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1">Target Tab (if applicable):</label>
                <input
                  type="text"
                  value={tab || ''}
                  onChange={(e) => handleShortcutChange(key, 'tab', e.target.value)}
                  placeholder="e.g., dashboard, products"
                  className="p-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Import/Export (Offline) */}
      <div className="bg-gray-50 p-6 rounded-xl shadow-inner mb-8 border border-gray-200">
        <h4 className="text-2xl font-semibold text-gray-800 mb-4">Data Import / Export (Offline)</h4>
        <p className="text-gray-600 mb-4">
          Manage your application data. You can export all data to a JSON file for backup or import a previously exported file to restore data.
        </p>
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={handleExportAllData}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md flex items-center"
          >
            <Save className="h-5 w-5 mr-2" /> Export All Data (JSON)
          </button>
          <label htmlFor="importFileInput" className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md flex items-center cursor-pointer">
            <Upload className="h-5 w-5 mr-2" /> Import Data (JSON)
            <input
              type="file"
              id="importFileInput"
              accept=".json"
              onChange={handleImportAllData}
              className="hidden"
            />
          </label>
          <button
            onClick={handleClearAllData}
            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md flex items-center"
          >
            <AlertTriangle className="h-5 w-5 mr-2" /> Clear All Data
          </button>
        </div>
        <p className="text-sm text-red-500 mt-2">
          Clearing data will permanently delete all records from your browser's local storage. Export a backup first!
        </p>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-inner">
        <p className="text-blue-700">Additional settings and integrations will be added here.</p>
      </div>
    </div>
  );
};

export default App;
