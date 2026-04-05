/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/assets/js/partials/main-menu.js"
/*!*********************************************!*\
  !*** ./src/assets/js/partials/main-menu.js ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ \"./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js\");\n/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ \"./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/classCallCheck.js\");\n/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ \"./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/createClass.js\");\n/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ \"./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js\");\n/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ \"./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js\");\n/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ \"./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/inherits.js\");\n/* harmony import */ var _babel_runtime_helpers_wrapNativeSuper__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/wrapNativeSuper */ \"./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js\");\n\n\n\n\n\n\n\nfunction _callSuper(t, o, e) { return o = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(o), (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(t).constructor) : o.apply(t, e)); }\nfunction _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }\nvar NavigationMenu = /*#__PURE__*/function (_HTMLElement) {\n  function NavigationMenu() {\n    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(this, NavigationMenu);\n    return _callSuper(this, NavigationMenu, arguments);\n  }\n  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__[\"default\"])(NavigationMenu, _HTMLElement);\n  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(NavigationMenu, [{\n    key: \"connectedCallback\",\n    value: function connectedCallback() {\n      var _this = this;\n      salla.onReady().then(function () {\n        return salla.lang.onLoaded();\n      }).then(function () {\n        _this.menus = [];\n        _this.displayAllText = salla.lang.get('blocks.home.display_all');\n        _this.moreText = salla.lang.get('common.titles.more');\n        _this.visibleMenus = [];\n        _this.overflowMenus = [];\n        return salla.api.component.getMenus().then(function (_ref) {\n          var data = _ref.data;\n          _this.menus = data;\n          return _this.render();\n        }).then(function () {\n          _this.initializeResponsiveMenu();\n        })[\"catch\"](function (error) {\n          return salla.logger.error('salla-menu::Error fetching menus', error);\n        });\n      });\n    }\n\n    /** \r\n    * Check if the menu has children\r\n    * @param {Object} menu\r\n    * @returns {Boolean}\r\n    */\n  }, {\n    key: \"hasChildren\",\n    value: function hasChildren(menu) {\n      var _menu$children;\n      return (menu === null || menu === void 0 || (_menu$children = menu.children) === null || _menu$children === void 0 ? void 0 : _menu$children.length) > 0;\n    }\n\n    /**\r\n    * Check if the menu has products\r\n    * @param {Object} menu\r\n    * @returns {Boolean}\r\n    */\n  }, {\n    key: \"hasProducts\",\n    value: function hasProducts(menu) {\n      var _menu$products;\n      return (menu === null || menu === void 0 || (_menu$products = menu.products) === null || _menu$products === void 0 ? void 0 : _menu$products.length) > 0;\n    }\n\n    /**\r\n    * Get the classes for desktop menu\r\n    * @param {Object} menu\r\n    * @param {Boolean} isRootMenu\r\n    * @returns {String}\r\n    */\n  }, {\n    key: \"getDesktopClasses\",\n    value: function getDesktopClasses(menu, isRootMenu) {\n      return \"!hidden lg:!block \".concat(isRootMenu ? 'root-level lg:!inline-block' : 'relative', \" \").concat(menu.products ? ' mega-menu' : '', \"\\n        \").concat(this.hasChildren(menu) ? ' has-children' : '');\n    }\n\n    /**\r\n    * Get the mobile menu\r\n    * @param {Object} menu\r\n    * @param {String} displayAllText\r\n    * @returns {String}\r\n    */\n  }, {\n    key: \"getMobileMenu\",\n    value: function getMobileMenu(menu, displayAllText) {\n      var _this2 = this;\n      var menuImage = menu.image ? \"<img src=\\\"\".concat(menu.image, \"\\\" class=\\\"rounded-full\\\" width=\\\"48\\\" height=\\\"48\\\" alt=\\\"\").concat(menu.title, \"\\\" />\") : '';\n      return \"\\n        <li class=\\\"lg:hidden text-sm font-bold\\\" \".concat(menu.attrs, \">\\n            \").concat(!this.hasChildren(menu) ? \"\\n                <a href=\\\"\".concat(menu.url, \"\\\" aria-label=\\\"\").concat(menu.title || 'category', \"\\\" class=\\\"text-gray-500 \").concat(menu.image ? '!py-3' : '', \"\\\" \").concat(menu.link_attrs, \">\\n                    \").concat(menuImage, \"\\n                    <span>\").concat(menu.title || '', \"</span>\\n                </a>\") : \"\\n                <span class=\\\"\".concat(menu.image ? '!py-3' : '', \"\\\">\\n                    \").concat(menuImage, \"\\n                    \").concat(menu.title, \"\\n                </span>\\n                <ul>\\n                    <li class=\\\"text-sm font-bold\\\">\\n                        <a href=\\\"\").concat(menu.url, \"\\\" class=\\\"text-gray-500\\\">\").concat(displayAllText, \"</a>\\n                    </li>\\n                    \").concat(menu.children.map(function (subMenu) {\n        return _this2.getMobileMenu(subMenu, displayAllText);\n      }).join(''), \"\\n                </ul>\\n            \"), \"\\n        </li>\");\n    }\n\n    /**\r\n    * Get the desktop menu\r\n    * @param {Object} menu\r\n    * @param {Boolean} isRootMenu\r\n    * @param {String} additionalClasses\r\n    * @returns {String}\r\n    */\n  }, {\n    key: \"getDesktopMenu\",\n    value: function getDesktopMenu(menu, isRootMenu) {\n      var _this3 = this;\n      var additionalClasses = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';\n      return \"\\n        <li class=\\\"\".concat(this.getDesktopClasses(menu, isRootMenu), \" \").concat(additionalClasses, \"\\\" \").concat(menu.attrs, \" data-menu-item>\\n            <a href=\\\"\").concat(menu.url, \"\\\" aria-label=\\\"\").concat(menu.title || 'category', \"\\\" \").concat(menu.link_attrs, \">\\n                <span>\").concat(menu.title, \"</span>\\n            </a>\\n            \").concat(this.hasChildren(menu) ? \"\\n                <div class=\\\"sub-menu \".concat(this.hasProducts(menu) ? 'w-full left-0 flex' : 'w-56', \"\\\">\\n                    <ul class=\\\"\").concat(this.hasProducts(menu) ? 'w-56 shrink-0 m-8 rtl:ml-0 ltr:mr-0' : '', \"\\\">\\n                        \").concat(menu.children.map(function (subMenu) {\n        return _this3.getDesktopMenu(subMenu, false);\n      }).join('\\n'), \"\\n                    </ul>\\n                    \").concat(this.hasProducts(menu) ? \"\\n                    <salla-products-list\\n                    source=\\\"selected\\\"\\n                    shadow-on-hover\\n                    source-value=\\\"[\".concat(menu.products, \"]\\\" />\") : '', \"\\n                </div>\") : '', \"\\n        </li>\");\n    }\n\n    /**\r\n    * Get the menus - Desktop only (mobile menu is separate)\r\n    * @returns {String}\r\n    */\n  }, {\n    key: \"getMenus\",\n    value: function getMenus() {\n      var _this4 = this;\n      // Only return desktop menu items to avoid duplicates\n      return this.menus.map(function (menu) {\n        return \"\\n            \".concat(_this4.getDesktopMenu(menu, true), \"\\n        \");\n      }).join('\\n');\n    }\n\n    /**\r\n    * Get mobile menus separately\r\n    * @returns {String}\r\n    */\n  }, {\n    key: \"getMobileMenus\",\n    value: function getMobileMenus() {\n      var _this5 = this;\n      return this.menus.map(function (menu) {\n        return \"\\n            \".concat(_this5.getMobileMenu(menu, _this5.displayAllText), \"\\n        \");\n      }).join('\\n');\n    }\n\n    /**\r\n    * Create More dropdown menu\r\n    * @returns {String}\r\n    */\n  }, {\n    key: \"createMoreDropdown\",\n    value: function createMoreDropdown() {\n      var _this6 = this;\n      if (this.overflowMenus.length === 0) return '';\n      return \"\\n        <li class=\\\"!hidden lg:!block root-level lg:!inline-block has-children relative\\\" id=\\\"more-menu-dropdown\\\">\\n            <a href=\\\"#\\\" aria-label=\\\"\".concat(this.moreText, \"\\\">\\n                <span>\").concat(this.moreText, \"</span>\\n            </a>\\n            <div class=\\\"sub-menu w-56\\\">\\n                <ul>\\n                    \").concat(this.overflowMenus.map(function (menu) {\n        return _this6.getDesktopMenu(menu, false);\n      }).join('\\n'), \"\\n                </ul>\\n            </div>\\n        </li>\");\n    }\n\n    /*\r\n    * Initialize responsive menu functionality\r\n    */\n  }, {\n    key: \"initializeResponsiveMenu\",\n    value: function initializeResponsiveMenu() {\n      var _this7 = this;\n      if (window.innerWidth < 1024) return; // Only for desktop\n\n      var mainMenu = this.querySelector('.main-menu');\n      if (!mainMenu) return;\n\n      // Check if more menu is enabled from global window variable set in master.twig\n      var isMoreMenuEnabled = window.enable_more_menu;\n      if (!isMoreMenuEnabled) {\n        // If disabled, keep the menu behavior as original (no More dropdown / overflow handling)\n        return;\n      }\n      this.checkMenuOverflow();\n\n      // Re-check on window resize\n      var resizeHandler = this.debounce(function () {\n        _this7.checkMenuOverflow();\n      }, 250);\n      window.addEventListener('resize', resizeHandler);\n    }\n\n    /**\r\n    * Check if menu items overflow and move them to More dropdown\r\n    */\n  }, {\n    key: \"checkMenuOverflow\",\n    value: function checkMenuOverflow() {\n      var _this8 = this;\n      var mainMenu = this.querySelector('.main-menu');\n      if (!mainMenu) return;\n      var container = mainMenu.closest('.container');\n      if (!container) return;\n\n      // Reset menus\n      this.visibleMenus = (0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(this.menus);\n      this.overflowMenus = [];\n\n      // Remove existing more dropdown\n      var existingMore = mainMenu.querySelector('#more-menu-dropdown');\n      if (existingMore) {\n        existingMore.remove();\n      }\n\n      // Show all menu items first\n      var menuItems = mainMenu.querySelectorAll('.root-level[data-menu-item]');\n      menuItems.forEach(function (item) {\n        item.style.display = '';\n      });\n\n      // Calculate available width\n      var containerWidth = container.offsetWidth;\n      var otherElements = container.querySelector('.flex').children;\n      var usedWidth = 0;\n\n      // Calculate width used by logo and other elements\n      Array.from(otherElements).forEach(function (element) {\n        if (!element.contains(mainMenu)) {\n          usedWidth += element.offsetWidth;\n        }\n      });\n      var availableWidth = containerWidth - usedWidth - 300; // 300px buffer for More dropdown\n      var currentWidth = 0;\n      var visibleCount = 0;\n\n      // Check each menu item\n      menuItems.forEach(function (item, index) {\n        var itemWidth = item.offsetWidth;\n        if (currentWidth + itemWidth <= availableWidth && index < _this8.menus.length) {\n          currentWidth += itemWidth;\n          visibleCount++;\n        } else {\n          // Hide overflow items\n          item.style.setProperty('display', 'none', 'important');\n          if (index < _this8.menus.length) {\n            _this8.overflowMenus.push(_this8.menus[index]);\n          }\n        }\n      });\n\n      // Update visible menus\n      this.visibleMenus = this.menus.slice(0, visibleCount);\n\n      // Add More dropdown if needed\n      if (this.overflowMenus.length > 0) {\n        mainMenu.insertAdjacentHTML('beforeend', this.createMoreDropdown());\n      }\n    }\n\n    /**\r\n    * Debounce function to limit resize event calls\r\n    * @param {Function} func\r\n    * @param {Number} wait\r\n    * @returns {Function}\r\n    */\n  }, {\n    key: \"debounce\",\n    value: function debounce(func, wait) {\n      var timeout;\n      return function executedFunction() {\n        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {\n          args[_key] = arguments[_key];\n        }\n        var later = function later() {\n          clearTimeout(timeout);\n          func.apply(void 0, args);\n        };\n        clearTimeout(timeout);\n        timeout = setTimeout(later, wait);\n      };\n    }\n\n    /**\r\n    * Render the header menu\r\n    */\n  }, {\n    key: \"render\",\n    value: function render() {\n      this.innerHTML = \"\\n        <nav id=\\\"mobile-menu\\\" class=\\\"mobile-menu\\\">\\n            <ul class=\\\"main-menu\\\">\".concat(this.getMobileMenus(), \"</ul>\\n            <button class=\\\"btn--close close-mobile-menu sicon-cancel lg:hidden\\\"></button>\\n        </nav>\\n        <ul class=\\\"main-menu desktop-menu\\\">\").concat(this.getMenus(), \"</ul>\\n        <button class=\\\"btn--close-sm close-mobile-menu sicon-cancel hidden\\\"></button>\");\n    }\n  }]);\n}(/*#__PURE__*/(0,_babel_runtime_helpers_wrapNativeSuper__WEBPACK_IMPORTED_MODULE_6__[\"default\"])(HTMLElement));\ncustomElements.define('custom-main-menu', NavigationMenu);\n\n//# sourceURL=webpack://theme-mobex/./src/assets/js/partials/main-menu.js?\n}");

/***/ },

/***/ "./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/classCallCheck.js"
/*!************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/classCallCheck.js ***!
  \************************************************************************************************************/
() {

eval("{throw new Error(\"Module build failed: Error: ENOENT: no such file or directory, open 'C:\\\\Users\\\\HP\\\\Downloads\\\\theme-main\\\\theme-main\\\\theme\\\\theme\\\\theme\\\\theme\\\\node_modules\\\\.pnpm\\\\@babel+runtime@7.29.2\\\\node_modules\\\\@babel\\\\runtime\\\\helpers\\\\esm\\\\classCallCheck.js'\");\n\n//# sourceURL=webpack://theme-mobex/./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/classCallCheck.js?\n}");

/***/ },

/***/ "./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/createClass.js"
/*!*********************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/createClass.js ***!
  \*********************************************************************************************************/
() {

eval("{throw new Error(\"Module build failed: Error: ENOENT: no such file or directory, open 'C:\\\\Users\\\\HP\\\\Downloads\\\\theme-main\\\\theme-main\\\\theme\\\\theme\\\\theme\\\\theme\\\\node_modules\\\\.pnpm\\\\@babel+runtime@7.29.2\\\\node_modules\\\\@babel\\\\runtime\\\\helpers\\\\esm\\\\createClass.js'\");\n\n//# sourceURL=webpack://theme-mobex/./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/createClass.js?\n}");

/***/ },

/***/ "./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js"
/*!************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js ***!
  \************************************************************************************************************/
() {

eval("{throw new Error(\"Module build failed: Error: ENOENT: no such file or directory, open 'C:\\\\Users\\\\HP\\\\Downloads\\\\theme-main\\\\theme-main\\\\theme\\\\theme\\\\theme\\\\theme\\\\node_modules\\\\.pnpm\\\\@babel+runtime@7.29.2\\\\node_modules\\\\@babel\\\\runtime\\\\helpers\\\\esm\\\\getPrototypeOf.js'\");\n\n//# sourceURL=webpack://theme-mobex/./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js?\n}");

/***/ },

/***/ "./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/inherits.js"
/*!******************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/inherits.js ***!
  \******************************************************************************************************/
() {

eval("{throw new Error(\"Module build failed: Error: ENOENT: no such file or directory, open 'C:\\\\Users\\\\HP\\\\Downloads\\\\theme-main\\\\theme-main\\\\theme\\\\theme\\\\theme\\\\theme\\\\node_modules\\\\.pnpm\\\\@babel+runtime@7.29.2\\\\node_modules\\\\@babel\\\\runtime\\\\helpers\\\\esm\\\\inherits.js'\");\n\n//# sourceURL=webpack://theme-mobex/./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/inherits.js?\n}");

/***/ },

/***/ "./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js"
/*!***********************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js ***!
  \***********************************************************************************************************************/
() {

eval("{throw new Error(\"Module build failed: Error: ENOENT: no such file or directory, open 'C:\\\\Users\\\\HP\\\\Downloads\\\\theme-main\\\\theme-main\\\\theme\\\\theme\\\\theme\\\\theme\\\\node_modules\\\\.pnpm\\\\@babel+runtime@7.29.2\\\\node_modules\\\\@babel\\\\runtime\\\\helpers\\\\esm\\\\possibleConstructorReturn.js'\");\n\n//# sourceURL=webpack://theme-mobex/./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js?\n}");

/***/ },

/***/ "./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js"
/*!***************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js ***!
  \***************************************************************************************************************/
() {

eval("{throw new Error(\"Module build failed: Error: ENOENT: no such file or directory, open 'C:\\\\Users\\\\HP\\\\Downloads\\\\theme-main\\\\theme-main\\\\theme\\\\theme\\\\theme\\\\theme\\\\node_modules\\\\.pnpm\\\\@babel+runtime@7.29.2\\\\node_modules\\\\@babel\\\\runtime\\\\helpers\\\\esm\\\\toConsumableArray.js'\");\n\n//# sourceURL=webpack://theme-mobex/./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js?\n}");

/***/ },

/***/ "./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js"
/*!*************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js ***!
  \*************************************************************************************************************/
() {

eval("{throw new Error(\"Module build failed: Error: ENOENT: no such file or directory, open 'C:\\\\Users\\\\HP\\\\Downloads\\\\theme-main\\\\theme-main\\\\theme\\\\theme\\\\theme\\\\theme\\\\node_modules\\\\.pnpm\\\\@babel+runtime@7.29.2\\\\node_modules\\\\@babel\\\\runtime\\\\helpers\\\\esm\\\\wrapNativeSuper.js'\");\n\n//# sourceURL=webpack://theme-mobex/./node_modules/.pnpm/@babel+runtime@7.29.2/node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js?\n}");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/assets/js/partials/main-menu.js");
/******/ 	
/******/ })()
;