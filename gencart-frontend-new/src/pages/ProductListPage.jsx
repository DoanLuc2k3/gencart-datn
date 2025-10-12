import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Input,
  Select,
  Spin,
  Empty,
  message,
  Space,
  Tag,
  Tooltip,
  Slider,
  Rate,
  Checkbox,
} from "antd";
import {
  ShoppingCartOutlined,
  SearchOutlined,
  ReloadOutlined,
  StarFilled,
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { inventoryEvents } from "../utils/inventoryEvents";
import useDebounce from "../hooks/useDebounce";
import useScrollToTop from "../hooks/useScrollToTop";
import GridProductCard from "../components/products/GridProductCard";
import ListProductCard from "../components/products/ListProductCard";
import { formatCurrency, discountPercent } from "../utils/format";
import "./ProductListPage.css";

const { Title, Text, Paragraph } = Typography;
// const { Meta } = Card; // Meta unused, keep commented
const { Option } = Select;
const { Search } = Input;

// Category color mapping
const CATEGORY_COLORS = Object.freeze({
  Electronics: "2196F3",
  Clothing: "4CAF50",
  "Home & Kitchen": "FF9800",
  Books: "9C27B0",
  "Sports & Outdoors": "F44336",
  "Phone & Accessories": "009688",
});
const getCategoryColor = (name) => CATEGORY_COLORS[name] || "607D8B";

// Local storage helpers
const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback; // ignore parse errors
  }
};
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

const ProductListPage = () => {
  // Scroll to top when navigating to this page
  useScrollToTop();

  const [products, setProducts] = useState([]); // Current page products from server
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // raw user input
  const [selectedCategory, setSelectedCategory] = useState(null); // Now stores category name instead of ID
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState(() =>
    loadFromStorage("productViewMode", "grid")
  ); // persisted
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageButtons, setPageButtons] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 12; // Match backend page_size
  // Advanced filters
  const [priceRange, setPriceRange] = useState([0, 1000]); // Default max price
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const [onlyOnSale, setOnlyOnSale] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [initialFetched, setInitialFetched] = useState(false);
  const [wishlist, setWishlist] = useState(() =>
    loadFromStorage("wishlistProductIds", [])
  );
  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // Reduce debounce to make typing feel more responsive
  const debouncedSearch = useDebounce(searchTerm, 250);
  // Keep a ref to abort in‑flight product fetches when a new search fires
  const activeFetchRef = useRef(null);
  // Ref for Main Content section to scroll to when changing pages
  const mainContentRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Helper function to scroll to top when changing pages
  const scrollToTop = () => {
    // Try multiple methods to ensure scroll works
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  };

  // Persist view mode & wishlist
  useEffect(() => {
    saveToStorage("productViewMode", viewMode);
  }, [viewMode]);
  useEffect(() => {
    saveToStorage("wishlistProductIds", wishlist);
  }, [wishlist]);

  // Parse query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const search = queryParams.get("search");
    const categoryName = queryParams.get("category");
    const sort = queryParams.get("sort");
    const page = queryParams.get("page");

    if (search) setSearchTerm(search);
    if (categoryName) setSelectedCategory(categoryName); // Directly use category name
    if (sort) setSortBy(sort);
    if (page) {
      const pageNum = parseInt(page, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        setCurrentPage(pageNum);
      }
    }
  }, [location.search]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/categories/");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        console.log("Categories API response:", data);

        // Check if data is an array or has a results property
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data.results && Array.isArray(data.results)) {
          setCategories(data.results);
        } else {
          // If neither, set an empty array
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        message.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // // Function to fetch a single page of products (supports abort)
  // const fetchProductsPage = async (baseUrl, abortSignal) => {
  //   const separator = baseUrl.includes("?") ? "&" : "?";
  //   const urlWithTimestamp = `${baseUrl}${separator}_bust=${Date.now()}&_random=${Math.random()}`;
  //   console.log("Fetching products from:", urlWithTimestamp);
  //   const response = await fetch(urlWithTimestamp, { signal: abortSignal });
  //   if (!response.ok) throw new Error("Failed to fetch products");
  //   const data = await response.json();
    
  //   // Handle paginated response
  //   if (data.results && Array.isArray(data.results)) {
  //     return {
  //       products: data.results,
  //       totalCount: data.count || 0,
  //       totalPages: data.total_pages || 1,
  //       currentPage: data.current_page || 1,
  //       pageButtons: data.page_buttons || [],
  //     };
  //   }
  //   // Fallback for non-paginated response
  //   if (Array.isArray(data)) {
  //     return {
  //       products: data,
  //       totalCount: data.length,
  //       totalPages: 1,
  //       currentPage: 1,
  //       pageButtons: [],
  //     };
  //   }
  //   console.warn("Unexpected products response shape", data);
  //   return {
  //     products: [],
  //     totalCount: 0,
  //     totalPages: 1,
  //     currentPage: 1,
  //     pageButtons: [],
  //   };
  // };

  // Central fetch function - server-side pagination with filters
  const fetchProducts = useCallback(
    async (overrideSearchTerm = null) => {
      console.log("ProductListPage: Starting fetchProducts...");
      if (activeFetchRef.current) {
        activeFetchRef.current.abort();
      }
      const controller = new AbortController();
      activeFetchRef.current = controller;
      setLoading(true);
      try {
        // Build URL with server-side filters
        let baseUrl = "http://localhost:8000/api/products/?";
        
        // Pagination parameters
        baseUrl += `page=${currentPage}&`;
        baseUrl += `limit=${ITEMS_PER_PAGE}&`;
        
        // Search
        const effectiveSearch =
          overrideSearchTerm !== null ? overrideSearchTerm : debouncedSearch;
        if (effectiveSearch)
          baseUrl += `search=${encodeURIComponent(effectiveSearch)}&`;
        
        // Category filter
        if (selectedCategory) {
          baseUrl += `category=${encodeURIComponent(selectedCategory)}&`;
        }
        
        // Sorting
        if (sortBy) baseUrl += `ordering=${sortBy}&`;
        
        // Price range filter
        if (selectedPriceRange[0] > 0) {
          baseUrl += `min_price=${selectedPriceRange[0]}&`;
        }
        if (selectedPriceRange[1] < 1000) {
          baseUrl += `max_price=${selectedPriceRange[1]}&`;
        }
        
        // Rating filter
        if (minRating > 0) {
          baseUrl += `min_rating=${minRating}&`;
        }
        
        // On sale filter
        if (onlyOnSale) {
          baseUrl += `on_sale=true&`;
        }
        
        // In stock filter
        if (onlyInStock) {
          baseUrl += `in_stock=true&`;
        }
        
        // Cache buster
        baseUrl += `_=${Date.now()}`;
        
        console.log("ProductListPage: Fetching products from:", baseUrl);
        const response = await fetch(baseUrl, { signal: controller.signal });
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        
        console.log("ProductListPage: Response data:", data);
        
        // Update state with paginated results
        const fetchedProducts = data.results || [];
        setProducts(fetchedProducts);
        setTotalCount(data.count || 0);
        setTotalPages(data.total_pages || 1);
        setPageButtons(data.page_buttons || []);
        
        console.log("ProductListPage: Products count:", fetchedProducts.length);
        console.log("ProductListPage: Total pages:", data.total_pages);
        
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Fetch aborted (expected during rapid updates)");
        } else {
          console.error("Error fetching products:", error);
          message.error("Failed to load products");
        }
      } finally {
        if (activeFetchRef.current === controller) {
          setLoading(false);
          activeFetchRef.current = null;
        }
        console.log("ProductListPage: fetchProducts completed");
      }
    },
    [currentPage, debouncedSearch, selectedCategory, sortBy, selectedPriceRange, minRating, onlyOnSale, onlyInStock]
  );

  // Fetch products when debounced term / filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Inventory refresh subscription
  useEffect(() => {
    const unsubscribe = inventoryEvents.subscribe((event) => {
      if (event.type === "ALL_REFRESH" || event.type === "PRODUCT_REFRESH") {
        fetchProducts();
      }
    });
    return () => unsubscribe();
  }, [fetchProducts]);

  // Products are already filtered and paginated by server
  const displayedProducts = products;

  // Handle search
  const handleSearch = (value) => {
    scrollToTop(); // Scroll to top immediately
    // Immediate fetch (skip debounce wait) for explicit search action
    setSearchTerm(value);
    setCurrentPage(1); // Reset to page 1 on new search
    updateQueryParams({ search: value, page: 1 });
    fetchProducts(value);
  };

  // Handle category change - now works with category names
  const handleCategoryChange = (value) => {
    scrollToTop(); // Scroll to top immediately
    setSelectedCategory(value); // Value is now category name
    setCurrentPage(1); // Reset to page 1 on category change
    updateQueryParams({ category: value, page: 1 }); // Directly use category name in URL
  };

  // Handle sort change
  const handleSortChange = (value) => {
    scrollToTop(); // Scroll to top immediately
    setSortBy(value);
    setCurrentPage(1); // Reset to page 1 on sort change
    updateQueryParams({ sort: value, page: 1 });
  };

  // Reset to page 1 when filters change (price, rating, on sale, in stock)
  useEffect(() => {
    if (currentPage !== 1) {
      scrollToTop(); // Scroll to top when filters change
    }
    setCurrentPage(1);
    updateQueryParams({ page: 1 });
  }, [selectedPriceRange, minRating, onlyOnSale, onlyInStock]);

  // Update query parameters
  const updateQueryParams = (params) => {
    const queryParams = new URLSearchParams(location.search);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        queryParams.set(key, value);
      } else {
        queryParams.delete(key);
      }
    });

    navigate({
      pathname: location.pathname,
      search: queryParams.toString(),
    });
  };

  // Get cart functions from context
  const { addToCart: addToCartContext } = useCart();

  // Add to cart
  const addToCart = (product) => {
    addToCartContext(product);
    message.success(`${product.name} added to cart!`);
  };

  // Refresh products
  const handleRefresh = () => {
    message.loading("Refreshing products...", 1);
    // Re-run the effect by changing a dependency
    setSortBy((prev) => {
      // Toggle between name and -name to force a refresh
      return prev === "name" ? "-name" : "name";
    });
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Modern Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "40px 24px 48px", // reduced vertical padding
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Page Title */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Title
              level={1}
              style={{
                color: "white",
                marginBottom: "8px",
                fontSize: "clamp(2.1rem, 4.2vw, 3.05rem)", // slightly smaller
                fontWeight: "800",
                textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                letterSpacing: "-0.02em",
              }}
            >
              Discover Amazing Products
            </Title>
            <Paragraph
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
                maxWidth: "600px",
                margin: "0 auto",
                lineHeight: "1.6",
              }}
            >
              Find exactly what you're looking for from our curated collection
              of premium products
            </Paragraph>
          </div>

          {/* Enhanced Search and Filter Bar */}
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(18px)",
              borderRadius: "20px",
              padding: "24px",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <Row gutter={[20, 20]} align="top" className="filter-bar-row">
              {/* Search Bar */}
              <Col xs={24} sm={24} md={12} lg={9} xl={9}>
                <div className="filter-group">
                  <Text className="filter-label">
                    <SearchOutlined style={{ marginRight: 6 }} /> Search
                    Products
                  </Text>
                  <Search
                    placeholder="What are you looking for?"
                    value={searchTerm}
                    allowClear
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={handleSearch}
                    size="large"
                    style={{ width: "100%" }}
                    className="modern-search"
                  />
                </div>
              </Col>

              {/* Category Filter */}
              <Col xs={24} sm={12} md={6} lg={5} xl={5}>
                <div className="filter-group">
                  <Text className="filter-label">
                    <FilterOutlined style={{ marginRight: 6 }} /> Category
                  </Text>
                  <Select
                    placeholder="All Categories"
                    style={{ width: "100%" }}
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    allowClear
                    size="large"
                    showSearch
                    className="modern-select"
                  >
                    {categories.map((category) => (
                      <Option key={category.id} value={category.name}>
                        <Space size={8}>
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              background: `#${getCategoryColor(category.name)}`,
                            }}
                          />
                          {category.name}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>

              {/* Sort Options */}
              <Col xs={24} sm={12} md={6} lg={5} xl={5}>
                <div className="filter-group">
                  <Text className="filter-label">Sort By</Text>
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    size="large"
                    style={{ width: "100%" }}
                    className="modern-select"
                  >
                    <Option value="name">Name (A-Z)</Option>
                    <Option value="-name">Name (Z-A)</Option>
                    <Option value="price">Price: Low to High</Option>
                    <Option value="-price">Price: High to Low</Option>
                    <Option value="-average_rating">Rating: High to Low</Option>
                    <Option value="average_rating">Rating: Low to High</Option>
                    <Option value="-created_at">Newest First</Option>
                    <Option value="created_at">Oldest First</Option>
                  </Select>
                </div>
              </Col>

              {/* View Mode Toggle */}
              <Col xs={12} sm={6} md={4} lg={2} xl={2}>
                <div className="filter-group">
                  <Text className="filter-label">View</Text>
                  <Button.Group size="large" style={{ width: "100%" }}>
                    <Button
                      type={viewMode === "grid" ? "primary" : "default"}
                      icon={<AppstoreOutlined />}
                      onClick={() => setViewMode("grid")}
                      style={{
                        flex: 1,
                        background:
                          viewMode === "grid"
                            ? "rgba(255,255,255,0.2)"
                            : "transparent",
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white",
                      }}
                      loading={loading}
                    />
                    <Button
                      type={viewMode === "list" ? "primary" : "default"}
                      icon={<UnorderedListOutlined />}
                      onClick={() => setViewMode("list")}
                      style={{
                        flex: 1,
                        background:
                          viewMode === "list"
                            ? "rgba(255,255,255,0.2)"
                            : "transparent",
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white",
                      }}
                    />
                  </Button.Group>
                </div>
              </Col>

              {/* Refresh & Filters */}
              <Col xs={12} sm={6} md={4} lg={3} xl={3}>
                <div className="filter-group">
                  <Text className="filter-label">Action</Text>
                  <Space size={8} style={{ width: "100%", display: "flex" }}>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleRefresh}
                      size="large"
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.1)",
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white",
                      }}
                      aria-label="Refresh products"
                    />
                    <Button
                      size="large"
                      onClick={() => setShowFilters((p) => !p)}
                      style={{
                        flex: 1,
                        background: showFilters
                          ? "rgba(255,255,255,0.25)"
                          : "rgba(255,255,255,0.1)",
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    >
                      {showFilters ? "Hide" : "Filters"}
                    </Button>
                  </Space>
                </div>
              </Col>
            </Row>
            {showFilters && (
              <div
                style={{
                  marginTop: 20,
                  background: "rgba(255,255,255,0.15)",
                  padding: 18,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12} lg={8}>
                    <Text
                      style={{
                        color: "white",
                        fontWeight: 600,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Price Range
                    </Text>
                    <Slider
                      range
                      min={priceRange[0]}
                      max={priceRange[1] || 0}
                      tooltip={{ formatter: (val) => formatCurrency(val) }}
                      value={selectedPriceRange}
                      onChange={setSelectedPriceRange}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "white",
                        fontSize: 12,
                      }}
                    >
                      <span>{formatCurrency(selectedPriceRange[0])}</span>
                      <span>{formatCurrency(selectedPriceRange[1])}</span>
                    </div>
                  </Col>
                  <Col xs={24} md={12} lg={6}>
                    <Text
                      style={{
                        color: "white",
                        fontWeight: 600,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Minimum Rating
                    </Text>
                    <Rate
                      allowClear
                      value={minRating}
                      onChange={setMinRating}
                    />
                  </Col>
                  <Col xs={24} md={12} lg={5}>
                    <Text
                      style={{
                        color: "white",
                        fontWeight: 600,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Flags
                    </Text>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <Checkbox
                        style={{ color: "white" }}
                        checked={onlyOnSale}
                        onChange={(e) => setOnlyOnSale(e.target.checked)}
                      >
                        On Sale
                      </Checkbox>
                      <Checkbox
                        style={{ color: "white" }}
                        checked={onlyInStock}
                        onChange={(e) => setOnlyInStock(e.target.checked)}
                      >
                        In Stock
                      </Checkbox>
                    </div>
                  </Col>
                  <Col xs={24} md={12} lg={5}>
                    <Text
                      style={{
                        color: "white",
                        fontWeight: 600,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Quick Actions
                    </Text>
                    <Space wrap direction="vertical" style={{ width: "100%" }}>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedPriceRange(priceRange);
                          setMinRating(0);
                          setOnlyOnSale(false);
                          setOnlyInStock(false);
                        }}
                        style={{
                          background: "rgba(239, 68, 68, 0.2)",
                          borderColor: "rgba(239, 68, 68, 0.4)",
                          color: "white",
                        }}
                      >
                        Reset All Filters
                      </Button>
                      {(selectedPriceRange[0] !== priceRange[0] || 
                        selectedPriceRange[1] !== priceRange[1] || 
                        minRating > 0 || 
                        onlyOnSale || 
                        onlyInStock) && (
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#fbbf24",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <FilterOutlined /> {
                            [
                              selectedPriceRange[0] !== priceRange[0] || selectedPriceRange[1] !== priceRange[1] ? 1 : 0,
                              minRating > 0 ? 1 : 0,
                              onlyOnSale ? 1 : 0,
                              onlyInStock ? 1 : 0
                            ].reduce((a, b) => a + b, 0)
                          } active filter(s)
                        </Text>
                      )}
                    </Space>
                  </Col>
                </Row>
              </div>
            )}
          </div>

          {/* Results Summary */}
          {!loading && (
            <div
              style={{
                textAlign: "center",
                marginTop: "20px",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                padding: "14px 16px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                {displayedProducts.length === 0 ? (
                  totalCount === 0 ? (
                    "No products found"
                  ) : (
                    "No products match your filters"
                  )
                ) : (
                  <>
                    Showing{" "}
                    <span
                      style={{
                        color: "#fbbf24",
                        fontWeight: "800",
                        fontSize: "20px",
                      }}
                    >
                      {displayedProducts.length}
                    </span>{" "}
                    of{" "}
                    <span
                      style={{
                        color: "#fbbf24",
                        fontWeight: "800",
                        fontSize: "20px",
                      }}
                    >
                      {totalCount}
                    </span>{" "}
                    amazing products
                    {totalPages > 1 && (
                      <span style={{ opacity: 0.85, fontSize: "16px" }}>
                        {" "}
                        (Page {currentPage} of {totalPages})
                      </span>
                    )}
                    {selectedCategory && (
                      <span style={{ opacity: 0.9 }}>
                        {" "}
                        in "{selectedCategory}"{" "}
                        {/* Directly use category name */}
                      </span>
                    )}
                    {searchTerm && (
                      <span style={{ opacity: 0.9 }}>
                        {" "}
                        matching "{searchTerm}"
                      </span>
                    )}
                  </>
                )}
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        ref={mainContentRef}
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "40px 20px", // reduced vertical padding
        }}
      >
          <Title
            level={2}
            style={{
              margin: 0,
              fontWeight: 800,
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: 1.2,
              background:
                "linear-gradient(135deg, #1e293b 0%, #475569 50%, #64748b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            Product List
          </Title>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "120px 40px",
              background: "white",
              borderRadius: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            }}
          >
            <Spin size="large" />
            <div style={{ marginTop: "24px" }}>
              <Title
                level={3}
                style={{
                  color: "#64748b",
                  fontWeight: "600",
                  margin: "16px 0 8px",
                }}
              >
                Loading Products
              </Title>
              <Text style={{ color: "#94a3b8", fontSize: "16px" }}>
                Discovering amazing products just for you...
              </Text>
            </div>
          </div>
        ) : products.length > 0 ? (
          <>
            {displayedProducts.length > 0 ? (
              <>
                {/* Grid View */}
                {viewMode === "grid" && (
                  <Row gutter={[20, 28]}>
                    {displayedProducts.map((p) => (
                      <Col xs={24} sm={12} md={8} lg={6} xl={6} key={p.id}>
                        <GridProductCard
                          product={p}
                          onView={(prod) => navigate(`/products/${prod.id}`)}
                          onAdd={addToCart}
                          wishlist={wishlist}
                          toggleWishlist={toggleWishlist}
                          formatCurrency={formatCurrency}
                          discountPercent={discountPercent}
                          getCategoryColor={getCategoryColor}
                        />
                      </Col>
                    ))}
                  </Row>
                )}

                {/* List View */}
                {viewMode === "list" && (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 20 }}
                  >
                    {displayedProducts.map((p) => (
                      <ListProductCard
                        key={p.id}
                        product={p}
                        onView={(prod) => navigate(`/products/${prod.id}`)}
                        onAdd={addToCart}
                        wishlist={wishlist}
                        toggleWishlist={toggleWishlist}
                        formatCurrency={formatCurrency}
                        discountPercent={discountPercent}
                        getCategoryColor={getCategoryColor}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 32px",
                  background: "white",
                  borderRadius: "20px",
                  boxShadow: "0 6px 28px rgba(0,0,0,0.06)",
                }}
              >
                <Empty
                  description={
                    <div>
                      <Title
                        level={3}
                        style={{
                          color: "#64748b",
                          fontWeight: "600",
                          margin: "16px 0 8px",
                        }}
                      >
                        No Products Match Your Filters
                      </Title>
                      <Text style={{ color: "#94a3b8", fontSize: "16px" }}>
                        Try adjusting your filter criteria to see more products
                      </Text>
                    </div>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <Button
                  type="primary"
                  size="large"
                  onClick={() => {
                    setSelectedPriceRange(priceRange);
                    setMinRating(0);
                    setOnlyOnSale(false);
                    setOnlyInStock(false);
                  }}
                  style={{
                    marginTop: "20px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: "10px",
                    height: "44px",
                    padding: "0 26px",
                    fontWeight: "600",
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && displayedProducts.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "48px",
                  padding: "24px",
                  background: "white",
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
              >
                {/* Previous Button */}
                <Button
                  onClick={() => {
                    scrollToTop(); // Scroll immediately first
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    updateQueryParams({ page: newPage });
                  }}
                  disabled={currentPage === 1}
                  style={{
                    borderRadius: "8px",
                    height: "40px",
                    padding: "0 16px",
                    fontWeight: "600",
                    border: "2px solid #e2e8f0",
                    background: currentPage === 1 ? "#f8fafc" : "white",
                  }}
                >
                  Previous
                </Button>

                {/* Page Buttons */}
                {pageButtons.map((btn, idx) => {
                  if (btn === "...") {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        style={{
                          padding: "0 8px",
                          color: "#94a3b8",
                          fontSize: "18px",
                          fontWeight: "bold",
                        }}
                      >
                        ...
                      </span>
                    );
                  }
                  const pageNum = typeof btn === "number" ? btn : parseInt(btn);
                  const isActive = pageNum === currentPage;
                  return (
                    <Button
                      key={`page-${pageNum}`}
                      onClick={() => {
                        scrollToTop(); // Scroll immediately first
                        setCurrentPage(pageNum);
                        updateQueryParams({ page: pageNum });
                      }}
                      style={{
                        borderRadius: "8px",
                        width: "40px",
                        height: "40px",
                        padding: "0",
                        fontWeight: "600",
                        border: isActive ? "none" : "2px solid #e2e8f0",
                        background: isActive
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "white",
                        color: isActive ? "white" : "#475569",
                        fontSize: "15px",
                      }}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                {/* Next Button */}
                <Button
                  onClick={() => {
                    scrollToTop(); // Scroll immediately first
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    updateQueryParams({ page: newPage });
                  }}
                  disabled={currentPage === totalPages}
                  style={{
                    borderRadius: "8px",
                    height: "40px",
                    padding: "0 16px",
                    fontWeight: "600",
                    border: "2px solid #e2e8f0",
                    background: currentPage === totalPages ? "#f8fafc" : "white",
                  }}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "60px 32px",
              background: "white",
              borderRadius: "20px",
              boxShadow: "0 6px 28px rgba(0,0,0,0.06)",
            }}
          >
            <Empty
              description={
                <div>
                  <Title
                    level={3}
                    style={{
                      color: "#64748b",
                      fontWeight: "600",
                      margin: "16px 0 8px",
                    }}
                  >
                    No Products Found
                  </Title>
                  <Text style={{ color: "#94a3b8", fontSize: "16px" }}>
                    Try adjusting your search criteria or browse all categories
                  </Text>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Button
              type="primary"
              size="large"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory(null);
                setCurrentPage(1);
                updateQueryParams({ search: null, category: null, page: 1 });
              }}
              style={{
                marginTop: "20px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "10px",
                height: "44px",
                padding: "0 26px",
                fontWeight: "600",
              }}
            >
              Browse All Products
            </Button>
          </div>
        )}
      </div>

      {/* Custom CSS for modern effects */}
      <style jsx>{`
        /* Modern Search Input - Fixed styling */
        .modern-search .ant-input-search-large {
          border-radius: 12px !important;
          overflow: visible;
        }
        
        .modern-search .ant-input-search,
        .modern-search .ant-input-search > .ant-input-group {
          border-radius: 12px !important;
        }
        
        .modern-search .ant-input-search .ant-input-group-wrapper {
          border-radius: 12px !important;
        }

        .modern-search .ant-input-affix-wrapper {
          border-radius: 12px 0 0 12px !important;
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
          border-right: none !important;
          background: rgba(255, 255, 255, 0.12) !important;
          backdrop-filter: blur(10px);
          height: 44px !important;
          padding: 0 16px !important;
        }
        
        .modern-search .ant-input-affix-wrapper:hover,
        .modern-search .ant-input-affix-wrapper:focus,
        .modern-search .ant-input-affix-wrapper-focused {
          border-color: rgba(255, 255, 255, 0.4) !important;
          box-shadow: none !important;
          background: rgba(255, 255, 255, 0.15) !important;
        }

        .modern-search .ant-input {
          background: transparent !important;
          color: white !important;
          font-size: 15px !important;
          border: none !important;
          box-shadow: none !important;
          height: 42px !important;
        }

        .modern-search .ant-input::placeholder {
          color: rgba(255, 255, 255, 0.6) !important;
        }

        .modern-search .ant-input:focus,
        .modern-search .ant-input:hover {
          background: transparent !important;
          box-shadow: none !important;
        }

        .modern-search .ant-input-clear-icon {
          color: rgba(255, 255, 255, 0.6) !important;
        }

        .modern-search .ant-input-clear-icon:hover {
          color: rgba(255, 255, 255, 0.9) !important;
        }

        .modern-search .ant-input-group-addon {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          border-radius: 0 12px 12px 0 !important;
        }

        .modern-search .ant-input-search-button,
        .modern-search .ant-btn.ant-input-search-button,
        .modern-search button.ant-btn.ant-input-search-button {
          border-radius: 0 12px 12px 0 !important;
          background: rgba(255, 255, 255, 0.18) !important;
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
          border-left: none !important;
          backdrop-filter: blur(10px);
          height: 44px !important;
          width: 50px !important;
          min-width: 50px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: none !important;
          color: white !important;
        }

        .modern-search .ant-input-search-button:hover,
        .modern-search .ant-btn.ant-input-search-button:hover,
        .modern-search button.ant-btn.ant-input-search-button:hover {
          background: rgba(255, 255, 255, 0.28) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
          border-radius: 0 12px 12px 0 !important;
        }

        .modern-search .ant-input-search-button .anticon,
        .modern-search .ant-btn.ant-input-search-button .anticon {
          color: white !important;
          font-size: 16px !important;
        }

        /* Force border radius on button right side */
        .modern-search .ant-input-search-button::before,
        .modern-search .ant-input-search-button::after {
          border-radius: 0 12px 12px 0 !important;
        }

        /* Modern Select */
        .modern-select .ant-select-selector {
          border-radius: 12px !important;
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
          background: rgba(255, 255, 255, 0.12) !important;
          backdrop-filter: blur(10px);
          height: 44px !important;
          display: flex;
          align-items: center;
          padding: 0 16px !important;
        }

        .modern-select .ant-select-selector:hover {
          border-color: rgba(255, 255, 255, 0.4) !important;
        }

        .modern-select .ant-select-selection-placeholder {
          color: rgba(255, 255, 255, 0.6) !important;
          line-height: 42px !important;
          font-size: 15px;
        }

        .modern-select .ant-select-selection-item {
          color: white !important;
          line-height: 42px !important;
          font-size: 15px;
        }

        .modern-select .ant-select-arrow {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        /* Button Groups and Buttons */
        .filter-bar-row .ant-btn {
          height: 44px !important;
          border-radius: 12px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
        }

        .filter-bar-row .ant-btn-group .ant-btn:first-child {
          border-radius: 12px 0 0 12px !important;
        }

        .filter-bar-row .ant-btn-group .ant-btn:last-child {
          border-radius: 0 12px 12px 0 !important;
        }

        .filter-bar-row .ant-btn:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
        }

        /* Filter Group Layout */
        .filter-bar-row .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          height: 100%;
        }

        .filter-label {
          color: rgba(255, 255, 255, 0.85);
          font-size: 13px;
          font-weight: 600;
          margin: 0;
          line-height: 1.2;
          display: flex;
          align-items: center;
          white-space: nowrap;
        }

        /* Product Cards Hover Effects */
        .modern-product-card:hover .product-overlay {
          opacity: 1 !important;
        }

        .modern-product-list-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .modern-search .ant-input-search .ant-input,
          .modern-select .ant-select-selector,
          .filter-bar-row .ant-btn {
            height: 40px !important;
          }

          .modern-search .ant-input-search-button {
            height: 40px !important;
          }

          .filter-label {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductListPage;
