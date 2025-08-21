// Application Data and State
const appData = {
    user: null,
    isAuthenticated: false,
    currentPlan: 'free',
    currencies: [
        {code: "USD", name: "US Dollar", symbol: "$", rate: 1.0},
        {code: "EUR", name: "Euro", symbol: "€", rate: 0.85},
        {code: "GBP", name: "British Pound", symbol: "£", rate: 0.73},
        {code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 110.0},
        {code: "CAD", name: "Canadian Dollar", symbol: "C$", rate: 1.25},
        {code: "AUD", name: "Australian Dollar", symbol: "A$", rate: 1.35},
        {code: "SGD", name: "Singapore Dollar", symbol: "S$", rate: 1.35},
        {code: "INR", name: "Indian Rupee", symbol: "₹", rate: 74.5},
        {code: "CHF", name: "Swiss Franc", symbol: "CHF", rate: 0.92},
        {code: "CNY", name: "Chinese Yuan", symbol: "¥", rate: 6.45},
        {code: "SEK", name: "Swedish Krona", symbol: "kr", rate: 8.5},
        {code: "NOK", name: "Norwegian Krone", symbol: "kr", rate: 8.8},
        {code: "DKK", name: "Danish Krone", symbol: "kr", rate: 6.3},
        {code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", rate: 1.42},
        {code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", rate: 7.8},
        {code: "KRW", name: "South Korean Won", symbol: "₩", rate: 1180.0},
        {code: "MXN", name: "Mexican Peso", symbol: "$", rate: 20.0},
        {code: "BRL", name: "Brazilian Real", symbol: "R$", rate: 5.2},
        {code: "RUB", name: "Russian Ruble", symbol: "₽", rate: 73.5},
        {code: "ZAR", name: "South African Rand", symbol: "R", rate: 14.5}
    ],
    subscriptionPlans: [
        {
            id: "free", name: "Free", price: 0, currency: "USD", interval: "month",
            features: ["Up to 5 meetings per month", "Basic cost calculation", "Meeting history (30 days)", "3 currencies", "Basic export (CSV)", "Email support"],
            limits: {meetings: 5, history: 30, currencies: 3, exports: 1}
        },
        {
            id: "pro", name: "Pro", price: 9, currency: "USD", interval: "month", popular: true,
            features: ["Unlimited meetings", "Advanced analytics & reporting", "All currencies (20+)", "Meeting trends & insights", "Custom hourly rates by role", "Meeting templates & presets", "All export formats (PDF, Excel, CSV)", "6+ months historical data", "Meeting efficiency scoring", "Cost optimization suggestions", "Calendar integration", "API access", "Priority support"],
            limits: {meetings: -1, history: -1, currencies: -1, exports: -1, templates: -1}
        },
        {
            id: "enterprise", name: "Enterprise", price: 29, currency: "USD", interval: "month",
            features: ["Everything in Pro", "Team collaboration & sharing", "Multi-team support", "Advanced reporting & insights", "Department-wise cost breakdown", "Custom integrations", "Webhook support", "2FA & advanced security", "GDPR compliance tools", "Dedicated account manager", "24/7 phone support", "Custom training & onboarding"],
            limits: {meetings: -1, history: -1, currencies: -1, exports: -1, templates: -1, teams: -1}
        }
    ],
    meetingTemplates: [
        {id: "daily-standup", name: "Daily Standup", duration: 15, participants: 6, category: "Development", description: "Quick team sync meeting", rate: 65},
        {id: "weekly-review", name: "Weekly Review", duration: 60, participants: 8, category: "Management", description: "Weekly team performance review", rate: 85},
        {id: "client-presentation", name: "Client Presentation", duration: 90, participants: 10, category: "Sales", description: "Client project presentation", rate: 95},
        {id: "planning-session", name: "Planning Session", duration: 120, participants: 5, category: "Strategy", description: "Strategic planning meeting", rate: 110}
    ],
    meetings: [
        {id: 1, title: "Weekly Team Standup", duration: 30, participants: 6, averageRate: 50, totalCost: 150, date: "2025-08-20", notes: "Regular team sync meeting", currency: "USD", efficiencyScore: 85},
        {id: 2, title: "Product Planning Session", duration: 120, participants: 4, averageRate: 75, totalCost: 600, date: "2025-08-19", notes: "Q4 roadmap planning", currency: "USD", efficiencyScore: 92},
        {id: 3, title: "Client Presentation", duration: 60, participants: 8, averageRate: 65, totalCost: 520, date: "2025-08-18", notes: "New project proposal", currency: "USD", efficiencyScore: 78}
    ],
    settings: {
        currency: "USD",
        defaultHourlyRate: 50,
        defaultParticipants: 5,
        workingHoursPerDay: 8,
        workingDaysPerWeek: 5,
        favoriteCurrencies: ["USD", "EUR", "GBP"],
        notifications: {
            emailMeetingReminders: true,
            emailWeeklyReports: true,
            emailBilling: false,
            inAppOptimization: true,
            inAppMilestones: true
        }
    },
    monthlyMeetingCount: 3,
    freeLimit: 5,
    currentView: 'home'
};

// Utility Functions
const utils = {
    formatCurrency: (amount, currencyCode = 'USD') => {
        const currency = appData.currencies.find(c => c.code === currencyCode) || appData.currencies[0];
        return `${currency.symbol}${amount.toFixed(2)}`;
    },
    
    convertCurrency: (amount, fromCurrency, toCurrency) => {
        if (fromCurrency === toCurrency) return amount;
        const from = appData.currencies.find(c => c.code === fromCurrency);
        const to = appData.currencies.find(c => c.code === toCurrency);
        if (!from || !to) return amount;
        
        const usdAmount = amount / from.rate;
        return usdAmount * to.rate;
    },
    
    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    generateId: () => Date.now() + Math.random().toString(36).substr(2, 9),
    
    calculateEfficiencyScore: (duration, participants) => {
        const baseScore = 100;
        const durationPenalty = Math.max(0, (duration - 30) * 0.5);
        const participantBonus = Math.min(20, participants * 2);
        const participantPenalty = participants > 10 ? (participants - 10) * 3 : 0;
        
        const score = Math.max(20, Math.min(100, baseScore - durationPenalty + participantBonus - participantPenalty));
        return Math.round(score);
    },
    
    getEfficiencySuggestion: (score, duration, participants) => {
        if (score >= 85) return "Excellent efficiency! This meeting is well-optimized.";
        if (score >= 70) return "Good efficiency. Consider reducing duration by 10-15 minutes.";
        if (score >= 50) return `Meeting could be improved. Try reducing to ${Math.max(15, duration - 15)} minutes or ${Math.max(3, participants - 2)} participants.`;
        return "Low efficiency. Consider if this meeting is necessary or split into smaller groups.";
    },

    downloadFile: (content, type, filename) => {
        const blob = new Blob([content], { type: type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

// Toast Notification System
const toast = {
    container: null,
    
    init() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },
    
    show(message, type = 'info', duration = 4000) {
        if (!this.container) this.init();
        
        const toastEl = document.createElement('div');
        toastEl.className = `toast toast--${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toastEl.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        this.container.appendChild(toastEl);
        
        setTimeout(() => toastEl.classList.add('show'), 100);
        
        setTimeout(() => {
            if (toastEl.parentElement) {
                toastEl.classList.add('hide');
                setTimeout(() => toastEl.remove(), 300);
            }
        }, duration);
        
        return toastEl;
    },
    
    success: (message, duration) => toast.show(message, 'success', duration),
    error: (message, duration) => toast.show(message, 'error', duration),
    warning: (message, duration) => toast.show(message, 'warning', duration),
    info: (message, duration) => toast.show(message, 'info', duration)
};

// Export Manager - Full Implementation
const exportManager = {
    currentFormat: 'csv',
    
    openModal() {
        const modal = document.getElementById('exportModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.initializeDateRange();
        }
    },
    
    closeModal() {
        const modal = document.getElementById('exportModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },
    
    initializeDateRange() {
        const fromDate = document.getElementById('exportFromDate');
        const toDate = document.getElementById('exportToDate');
        
        if (fromDate && toDate) {
            const today = new Date();
            const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
            
            fromDate.value = thirtyDaysAgo.toISOString().split('T')[0];
            toDate.value = today.toISOString().split('T')[0];
        }
    },
    
    getSelectedFormat() {
        const formatRadios = document.querySelectorAll('input[name="exportFormat"]');
        for (const radio of formatRadios) {
            if (radio.checked) {
                return radio.value;
            }
        }
        return 'csv';
    },
    
    getExportOptions() {
        return {
            includeCharts: document.getElementById('includeCharts')?.checked || false,
            includeNotes: document.getElementById('includeNotes')?.checked || false,
            includeEfficiency: document.getElementById('includeEfficiency')?.checked || false,
            includeSummary: document.getElementById('includeSummary')?.checked || false,
            fromDate: document.getElementById('exportFromDate')?.value,
            toDate: document.getElementById('exportToDate')?.value
        };
    },
    
    filterMeetingsByDate(meetings, fromDate, toDate) {
        if (!fromDate || !toDate) return meetings;
        
        const from = new Date(fromDate);
        const to = new Date(toDate);
        
        return meetings.filter(meeting => {
            const meetingDate = new Date(meeting.date);
            return meetingDate >= from && meetingDate <= to;
        });
    },
    
    async startExport() {
        const format = this.getSelectedFormat();
        const options = this.getExportOptions();
        
        const btn = document.querySelector('#exportModal .btn--primary');
        const btnText = btn?.querySelector('.btn-text');
        const spinner = btn?.querySelector('.spinner');
        
        if (btnText) btnText.style.display = 'none';
        if (spinner) spinner.classList.remove('hidden');
        if (btn) btn.disabled = true;
        
        try {
            const filteredMeetings = this.filterMeetingsByDate(appData.meetings, options.fromDate, options.toDate);
            
            if (filteredMeetings.length === 0) {
                toast.warning('No meetings found in the selected date range.');
                return;
            }
            
            switch (format) {
                case 'csv':
                    await this.exportToCSV(filteredMeetings, options);
                    break;
                case 'excel':
                    await this.exportToExcel(filteredMeetings, options);
                    break;
                case 'pdf':
                    await this.exportToPDF(filteredMeetings, options);
                    break;
            }
            
            toast.success(`${format.toUpperCase()} export completed successfully!`);
            this.closeModal();
            
        } catch (error) {
            console.error('Export error:', error);
            toast.error(`Export failed: ${error.message}`);
        } finally {
            if (btnText) btnText.style.display = 'inline';
            if (spinner) spinner.classList.add('hidden');
            if (btn) btn.disabled = false;
        }
    },
    
    async exportToCSV(meetings, options) {
        const headers = ['Title', 'Date', 'Duration (minutes)', 'Participants', 'Hourly Rate', 'Currency', 'Total Cost'];
        
        if (options.includeEfficiency) {
            headers.push('Efficiency Score');
        }
        if (options.includeNotes) {
            headers.push('Notes');
        }
        
        const rows = [headers];
        
        meetings.forEach(meeting => {
            const row = [
                meeting.title,
                meeting.date,
                meeting.duration,
                meeting.participants,
                meeting.averageRate,
                meeting.currency,
                meeting.totalCost.toFixed(2)
            ];
            
            if (options.includeEfficiency) {
                row.push(meeting.efficiencyScore || '');
            }
            if (options.includeNotes) {
                row.push(meeting.notes || '');
            }
            
            rows.push(row);
        });
        
        if (options.includeSummary) {
            const totalCost = meetings.reduce((sum, m) => sum + m.totalCost, 0);
            const avgEfficiency = meetings.reduce((sum, m) => sum + (m.efficiencyScore || 0), 0) / meetings.length;
            const totalTime = meetings.reduce((sum, m) => sum + m.duration, 0);
            
            rows.push([]);
            rows.push(['SUMMARY']);
            rows.push(['Total Meetings', meetings.length]);
            rows.push(['Total Cost', totalCost.toFixed(2)]);
            rows.push(['Average Efficiency', avgEfficiency.toFixed(1) + '%']);
            rows.push(['Total Time (hours)', (totalTime / 60).toFixed(1)]);
        }
        
        const csvContent = rows.map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
        
        const filename = `meeting-costs-${new Date().toISOString().split('T')[0]}.csv`;
        utils.downloadFile(csvContent, 'text/csv', filename);
    },
    
    async exportToExcel(meetings, options) {
        if (typeof XLSX === 'undefined') {
            throw new Error('Excel export library not loaded');
        }
        
        const workbook = XLSX.utils.book_new();
        
        const data = meetings.map(meeting => {
            const row = {
                'Title': meeting.title,
                'Date': meeting.date,
                'Duration (min)': meeting.duration,
                'Participants': meeting.participants,
                'Rate': meeting.averageRate,
                'Currency': meeting.currency,
                'Total Cost': meeting.totalCost
            };
            
            if (options.includeEfficiency) {
                row['Efficiency %'] = meeting.efficiencyScore || 0;
            }
            if (options.includeNotes) {
                row['Notes'] = meeting.notes || '';
            }
            
            return row;
        });
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Meeting Data");
        
        if (options.includeSummary) {
            const totalCost = meetings.reduce((sum, m) => sum + m.totalCost, 0);
            const avgEfficiency = meetings.reduce((sum, m) => sum + (m.efficiencyScore || 0), 0) / meetings.length;
            const totalTime = meetings.reduce((sum, m) => sum + m.duration, 0);
            
            const summaryData = [
                { Metric: 'Total Meetings', Value: meetings.length },
                { Metric: 'Total Cost', Value: totalCost.toFixed(2) },
                { Metric: 'Average Efficiency', Value: avgEfficiency.toFixed(1) + '%' },
                { Metric: 'Total Time (hours)', Value: (totalTime / 60).toFixed(1) }
            ];
            
            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
        }
        
        const filename = `meeting-costs-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, filename);
    },
    
    async exportToPDF(meetings, options) {
        if (typeof jsPDF === 'undefined') {
            throw new Error('PDF export library not loaded');
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.setTextColor(31, 184, 205);
        doc.text('Meeting Cost Report', 20, 20);
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
        doc.text(`Period: ${options.fromDate} to ${options.toDate}`, 20, 37);
        
        let yPosition = 50;
        
        if (options.includeSummary) {
            const totalCost = meetings.reduce((sum, m) => sum + m.totalCost, 0);
            const avgEfficiency = meetings.reduce((sum, m) => sum + (m.efficiencyScore || 0), 0) / meetings.length;
            const totalTime = meetings.reduce((sum, m) => sum + m.duration, 0);
            
            doc.setFontSize(16);
            doc.setTextColor(31, 184, 205);
            doc.text('Summary', 20, yPosition);
            yPosition += 10;
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Total Meetings: ${meetings.length}`, 20, yPosition);
            yPosition += 7;
            doc.text(`Total Cost: ${utils.formatCurrency(totalCost)}`, 20, yPosition);
            yPosition += 7;
            doc.text(`Average Efficiency: ${avgEfficiency.toFixed(1)}%`, 20, yPosition);
            yPosition += 7;
            doc.text(`Total Time: ${(totalTime / 60).toFixed(1)} hours`, 20, yPosition);
            yPosition += 15;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(31, 184, 205);
        doc.text('Meeting Details', 20, yPosition);
        yPosition += 10;
        
        meetings.forEach((meeting, index) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(12);
            doc.setTextColor(31, 184, 205);
            doc.text(`${index + 1}. ${meeting.title}`, 20, yPosition);
            yPosition += 7;
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Date: ${meeting.date}`, 25, yPosition);
            yPosition += 5;
            doc.text(`Duration: ${meeting.duration} minutes`, 25, yPosition);
            yPosition += 5;
            doc.text(`Participants: ${meeting.participants}`, 25, yPosition);
            yPosition += 5;
            doc.text(`Cost: ${utils.formatCurrency(meeting.totalCost, meeting.currency)}`, 25, yPosition);
            yPosition += 5;
            
            if (options.includeEfficiency && meeting.efficiencyScore) {
                doc.text(`Efficiency: ${meeting.efficiencyScore}%`, 25, yPosition);
                yPosition += 5;
            }
            
            if (options.includeNotes && meeting.notes) {
                const notes = doc.splitTextToSize(meeting.notes, 160);
                doc.text(`Notes: ${notes}`, 25, yPosition);
                yPosition += 5 * notes.length;
            }
            
            yPosition += 5;
        });
        
        const filename = `meeting-costs-report-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
    },
    
    exportCSV() {
        this.exportToCSV(appData.meetings, { 
            includeNotes: true, 
            includeEfficiency: true, 
            includeSummary: true 
        });
        toast.success('CSV export completed!');
    },
    
    async exportPDF() {
        try {
            await this.exportToPDF(appData.meetings, { 
                includeNotes: true, 
                includeEfficiency: true, 
                includeSummary: true,
                includeCharts: false
            });
            toast.success('PDF export completed!');
        } catch (error) {
            toast.error('PDF export failed: ' + error.message);
        }
    },
    
    async exportExcel() {
        try {
            await this.exportToExcel(appData.meetings, { 
                includeNotes: true, 
                includeEfficiency: true, 
                includeSummary: true,
                includeCharts: true
            });
            toast.success('Excel export completed!');
        } catch (error) {
            toast.error('Excel export failed: ' + error.message);
        }
    }
};

// Authentication System
const auth = {
    async login(email, password) {
        toast.info('Signing in...', 2000);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = {
                    id: utils.generateId(),
                    email: email,
                    firstName: 'John',
                    lastName: 'Doe',
                    company: 'Tech Corp',
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent('John Doe')}&background=1FB8CD&color=fff`,
                    plan: 'free',
                    joinedDate: new Date().toISOString()
                };
                
                appData.user = user;
                appData.isAuthenticated = true;
                appData.currentPlan = user.plan;
                
                this.updateUI();
                toast.success('Welcome back! Successfully logged in.');
                resolve(user);
            }, 1500);
        });
    },
    
    async signup(userData) {
        toast.info('Creating account...', 2000);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = {
                    id: utils.generateId(),
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    company: userData.company || '',
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.firstName + ' ' + userData.lastName)}&background=1FB8CD&color=fff`,
                    plan: 'free',
                    joinedDate: new Date().toISOString()
                };
                
                appData.user = user;
                appData.isAuthenticated = true;
                appData.currentPlan = user.plan;
                
                this.updateUI();
                toast.success('Account created successfully! Welcome to MeetingCost Pro.');
                resolve(user);
            }, 1500);
        });
    },
    
    async googleAuth() {
        toast.info('Connecting to Google...', 2000);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = {
                    id: utils.generateId(),
                    email: 'john.doe@gmail.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    company: 'Google Inc.',
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent('John Doe')}&background=1FB8CD&color=fff`,
                    plan: 'free',
                    joinedDate: new Date().toISOString(),
                    authProvider: 'google'
                };
                
                appData.user = user;
                appData.isAuthenticated = true;
                appData.currentPlan = user.plan;
                
                this.updateUI();
                toast.success('Successfully signed in with Google!');
                resolve(user);
            }, 2000);
        });
    },
    
    logout() {
        appData.user = null;
        appData.isAuthenticated = false;
        appData.currentPlan = 'free';
        
        this.updateUI();
        navigation.showView('home');
        toast.info('Successfully logged out.');
    },
    
    updateUI() {
        const userInfo = document.getElementById('userInfo');
        const authButtons = document.getElementById('authButtons');
        
        if (appData.isAuthenticated && userInfo && authButtons) {
            userInfo.style.display = 'flex';
            authButtons.style.display = 'none';
            
            const userAvatar = document.getElementById('userAvatar');
            const userName = document.getElementById('userName');
            const usageCounter = document.getElementById('usageCounter');
            
            if (userAvatar) userAvatar.src = appData.user.avatar;
            if (userName) userName.textContent = appData.user.firstName;
            if (usageCounter) {
                if (appData.currentPlan === 'free') {
                    usageCounter.textContent = `${appData.monthlyMeetingCount}/${appData.freeLimit} meetings used`;
                    usageCounter.style.background = 'var(--color-secondary)';
                    usageCounter.style.color = 'var(--color-text-secondary)';
                } else {
                    usageCounter.textContent = `${appData.currentPlan.toUpperCase()} Plan`;
                    usageCounter.style.background = 'var(--color-success)';
                    usageCounter.style.color = 'var(--color-btn-primary-text)';
                }
            }
        } else if (userInfo && authButtons) {
            userInfo.style.display = 'none';
            authButtons.style.display = 'flex';
        }
    }
};

// Navigation System - Fixed to prevent blocking
const navigation = {
    currentView: 'home',
    
    init() {
        this.setupEventListeners();
        this.showView('home');
    },
    
    setupEventListeners() {
        console.log('Setting up navigation event listeners');
        
        document.addEventListener('click', (e) => {
            const element = e.target.closest('[data-view]');
            if (element) {
                e.preventDefault();
                const view = element.getAttribute('data-view');
                console.log('Navigation clicked:', view);
                this.showView(view);
            }
        });
        
        this.setupUserDropdown();
        this.setupModalHandlers();
    },
    
    setupUserDropdown() {
        const userBtn = document.getElementById('userBtn');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userBtn && userDropdown) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
            
            document.addEventListener('click', (e) => {
                if (!userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            });
        }
    },
    
    setupModalHandlers() {
        const exportModal = document.getElementById('exportModal');
        if (exportModal) {
            exportModal.addEventListener('click', (e) => {
                if (e.target === exportModal) {
                    exportManager.closeModal();
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                exportManager.closeModal();
            }
        });
    },
    
    showView(viewName) {
        console.log('Attempting to show view:', viewName);
        
        // PUBLIC VIEWS - No authentication required
        const publicViews = ['home', 'calculator', 'pricing', 'login', 'signup'];
        
        // PROTECTED VIEWS - Require authentication  
        const protectedViews = ['dashboard', 'billing', 'profile'];
        
        // PRO VIEWS - Require pro plan
        const proViews = ['analytics'];
        
        // Handle protected views
        if (protectedViews.includes(viewName) && !appData.isAuthenticated) {
            console.log('Redirecting to login for protected view');
            this.showView('login');
            toast.warning('Please log in to access this feature.');
            return;
        }
        
        // Handle pro views
        if (proViews.includes(viewName)) {
            if (!appData.isAuthenticated) {
                this.showView('login');
                toast.warning('Please log in to access analytics.');
                return;
            }
            if (appData.currentPlan === 'free') {
                toast.warning('Upgrade to Pro to access advanced analytics.');
                this.showView('pricing');
                return;
            }
        }
        
        // Hide all views first
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show target view
        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;
            console.log('Successfully showed view:', viewName);
            
            this.updateActiveNavLink(viewName);
            this.initializeView(viewName);
        } else {
            console.error('View not found:', viewName);
            this.showView('home');
        }
    },
    
    updateActiveNavLink(viewName) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-view') === viewName) {
                link.classList.add('active');
            }
        });
    },
    
    initializeView(viewName) {
        console.log('Initializing view:', viewName);
        switch (viewName) {
            case 'calculator':
                calculator.init();
                break;
            case 'dashboard':
                dashboard.render();
                break;
            case 'analytics':
                analytics.render();
                break;
            case 'pricing':
                pricing.init();
                break;
            case 'payment':
                payment.init();
                break;
            case 'billing':
                billing.render();
                break;
            case 'settings':
                settings.init();
                break;
            case 'profile':
                profile.init();
                break;
        }
    }
};

// Calculator Module
const calculator = {
    currentCost: 0,
    currentEfficiency: 75,
    
    init() {
        console.log('Initializing calculator');
        this.setupEventListeners();
        this.loadSettings();
        this.populateTemplates();
        this.populateCurrencies();
        setTimeout(() => this.updateCalculation(), 100);
    },
    
    setupEventListeners() {
        const form = document.getElementById('meetingForm');
        if (form) {
            form.addEventListener('submit', (e) => this.saveMeeting(e));
            
            const inputs = form.querySelectorAll('input[type="number"], select');
            inputs.forEach(input => {
                input.addEventListener('input', utils.debounce(() => this.updateCalculation(), 300));
                input.addEventListener('change', () => this.updateCalculation());
            });
        }
        
        const templateSelect = document.getElementById('meetingTemplate');
        if (templateSelect) {
            templateSelect.addEventListener('change', (e) => {
                const templateId = e.target.value;
                if (templateId) {
                    this.applyTemplate(templateId);
                }
            });
        }
    },
    
    populateTemplates() {
        const select = document.getElementById('meetingTemplate');
        if (select) {
            select.innerHTML = '<option value="">Select a template...</option>';
            appData.meetingTemplates.forEach(template => {
                select.innerHTML += `<option value="${template.id}">${template.name} (${template.duration}m, ${template.participants} people)</option>`;
            });
        }
    },
    
    populateCurrencies() {
        const select = document.getElementById('currency');
        if (select) {
            select.innerHTML = '';
            const favoriteCurrencies = appData.settings.favoriteCurrencies;
            
            favoriteCurrencies.forEach(code => {
                const currency = appData.currencies.find(c => c.code === code);
                if (currency) {
                    select.innerHTML += `<option value="${currency.code}">${currency.code} (${currency.symbol})</option>`;
                }
            });
            
            if (favoriteCurrencies.length > 0) {
                select.innerHTML += '<option disabled>──────────</option>';
            }
            
            appData.currencies.forEach(currency => {
                if (!favoriteCurrencies.includes(currency.code)) {
                    select.innerHTML += `<option value="${currency.code}">${currency.code} (${currency.symbol})</option>`;
                }
            });
            
            select.value = appData.settings.currency;
        }
    },
    
    applyTemplate(templateId) {
        const template = appData.meetingTemplates.find(t => t.id === templateId);
        if (template) {
            document.getElementById('meetingTitle').value = template.name;
            document.getElementById('hours').value = Math.floor(template.duration / 60);
            document.getElementById('minutes').value = template.duration % 60;
            document.getElementById('participants').value = template.participants;
            document.getElementById('hourlyRate').value = template.rate || appData.settings.defaultHourlyRate;
            document.getElementById('notes').value = template.description;
            
            this.updateCalculation();
            toast.info(`Applied template: ${template.name}`);
        }
    },
    
    loadSettings() {
        const hourlyRateInput = document.getElementById('hourlyRate');
        const participantsInput = document.getElementById('participants');
        const currencySelect = document.getElementById('currency');
        
        if (hourlyRateInput) hourlyRateInput.value = appData.settings.defaultHourlyRate;
        if (participantsInput) participantsInput.value = appData.settings.defaultParticipants;
        if (currencySelect) currencySelect.value = appData.settings.currency;
    },
    
    updateCalculation() {
        const hours = parseInt(document.getElementById('hours')?.value) || 0;
        const minutes = parseInt(document.getElementById('minutes')?.value) || 0;
        const participants = parseInt(document.getElementById('participants')?.value) || 1;
        const hourlyRate = parseFloat(document.getElementById('hourlyRate')?.value) || 0;
        const currency = document.getElementById('currency')?.value || 'USD';
        
        const totalMinutes = (hours * 60) + minutes;
        const totalHours = totalMinutes / 60;
        const totalCost = totalHours * participants * hourlyRate;
        const costPerMinute = totalMinutes > 0 ? totalCost / totalMinutes : 0;
        
        this.currentCost = totalCost;
        this.currentEfficiency = utils.calculateEfficiencyScore(totalMinutes, participants);
        
        const currencySymbol = appData.currencies.find(c => c.code === currency)?.symbol || '$';
        
        this.updateElement('totalCost', `${currencySymbol}${totalCost.toFixed(2)}`);
        this.updateElement('durationDisplay', `${hours}h ${minutes}m`);
        this.updateElement('participantsDisplay', participants.toString());
        this.updateElement('rateDisplay', `${currencySymbol}${hourlyRate}/hour`);
        this.updateElement('costPerMinute', `${currencySymbol}${costPerMinute.toFixed(2)}`);
        
        this.updateEfficiencyDisplay(this.currentEfficiency, totalMinutes, participants);
    },
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },
    
    updateEfficiencyDisplay(score, duration, participants) {
        const scoreBar = document.getElementById('scoreBar');
        const scoreValue = document.getElementById('scoreValue');
        const scoreSuggestion = document.getElementById('scoreSuggestion');
        
        if (scoreBar) {
            scoreBar.style.width = `${score}%`;
        }
        if (scoreValue) {
            scoreValue.textContent = `${score}%`;
        }
        if (scoreSuggestion) {
            scoreSuggestion.textContent = utils.getEfficiencySuggestion(score, duration, participants);
        }
    },
    
    saveMeeting(e) {
        e.preventDefault();
        console.log('Attempting to save meeting');
        
        if (!appData.isAuthenticated) {
            toast.warning('Please sign up or log in to save meetings.');
            navigation.showView('signup');
            return;
        }
        
        if (appData.currentPlan === 'free' && appData.monthlyMeetingCount >= appData.freeLimit) {
            navigation.showView('pricing');
            toast.warning('You\'ve reached your free plan limit. Upgrade to Pro for unlimited meetings!');
            return;
        }
        
        const meetingData = {
            id: utils.generateId(),
            title: document.getElementById('meetingTitle').value || 'Untitled Meeting',
            duration: (parseInt(document.getElementById('hours').value) * 60) + parseInt(document.getElementById('minutes').value),
            participants: parseInt(document.getElementById('participants').value),
            averageRate: parseFloat(document.getElementById('hourlyRate').value),
            currency: document.getElementById('currency').value,
            totalCost: this.currentCost,
            efficiencyScore: this.currentEfficiency,
            date: new Date().toISOString().split('T')[0],
            notes: document.getElementById('notes').value || '',
            createdBy: appData.user?.id
        };
        
        if (meetingData.duration === 0) {
            toast.error('Please enter a meeting duration greater than 0.');
            return;
        }
        
        appData.meetings.unshift(meetingData);
        appData.monthlyMeetingCount++;
        
        auth.updateUI();
        
        e.target.reset();
        this.loadSettings();
        setTimeout(() => this.updateCalculation(), 100);
        
        toast.success('Meeting saved successfully!');
        setTimeout(() => navigation.showView('dashboard'), 1000);
    }
};

// Dashboard Module
const dashboard = {
    charts: {},
    
    render() {
        console.log('Rendering dashboard');
        this.updateStats();
        this.renderMeetingsList();
        this.renderCostChart();
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        const exportBtn = document.getElementById('exportDashboard');
        const searchInput = document.getElementById('meetingsSearch');
        const periodSelect = document.getElementById('chartPeriod');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => exportManager.openModal());
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce((e) => {
                this.filterMeetings(e.target.value);
            }, 300));
        }
        
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                this.renderCostChart(parseInt(e.target.value));
            });
        }
    },
    
    updateStats() {
        const totalCost = appData.meetings.reduce((sum, meeting) => sum + meeting.totalCost, 0);
        const totalMeetings = appData.meetings.length;
        const avgEfficiency = appData.meetings.reduce((sum, meeting) => sum + (meeting.efficiencyScore || 75), 0) / totalMeetings || 0;
        const totalTime = appData.meetings.reduce((sum, meeting) => sum + (meeting.duration / 60), 0);
        
        this.updateStatElement('totalMonthlyCost', utils.formatCurrency(totalCost));
        this.updateStatElement('totalMeetings', totalMeetings.toString());
        this.updateStatElement('avgEfficiency', `${Math.round(avgEfficiency)}%`);
        this.updateStatElement('totalTime', `${totalTime.toFixed(1)} hours`);
    },
    
    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },
    
    renderMeetingsList(meetings = appData.meetings) {
        const container = document.getElementById('meetingsList');
        if (!container) return;
        
        if (meetings.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 32px;">
                    <p style="color: var(--color-text-secondary);">No meetings found.</p>
                    <button class="btn btn--primary" data-view="calculator">Create Your First Meeting</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = meetings.map(meeting => `
            <div class="meeting-item">
                <div class="meeting-info">
                    <h4>${meeting.title}</h4>
                    <div class="meeting-meta">
                        ${utils.formatDate(meeting.date)} • ${Math.floor(meeting.duration / 60)}h ${meeting.duration % 60}m • ${meeting.participants} participants
                        ${meeting.efficiencyScore ? `• ${meeting.efficiencyScore}% efficiency` : ''}
                    </div>
                </div>
                <div class="meeting-cost">${utils.formatCurrency(meeting.totalCost, meeting.currency)}</div>
            </div>
        `).join('');
    },
    
    filterMeetings(query) {
        if (!query) {
            this.renderMeetingsList();
            return;
        }
        
        const filtered = appData.meetings.filter(meeting =>
            meeting.title.toLowerCase().includes(query.toLowerCase()) ||
            (meeting.notes && meeting.notes.toLowerCase().includes(query.toLowerCase()))
        );
        
        this.renderMeetingsList(filtered);
    },
    
    renderCostChart(days = 30) {
        const ctx = document.getElementById('costChart');
        if (!ctx) return;
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const recentMeetings = appData.meetings.filter(meeting => 
            new Date(meeting.date) >= cutoffDate
        );
        
        const chartData = {};
        recentMeetings.forEach(meeting => {
            if (!chartData[meeting.date]) {
                chartData[meeting.date] = 0;
            }
            chartData[meeting.date] += meeting.totalCost;
        });
        
        const sortedDates = Object.keys(chartData).sort();
        const costs = sortedDates.map(date => chartData[date]);
        
        if (this.charts.costChart) {
            this.charts.costChart.destroy();
        }
        
        this.charts.costChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDates.map(date => utils.formatDate(date)),
                datasets: [{
                    label: 'Daily Meeting Costs',
                    data: costs,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
};

// Analytics Module
const analytics = {
    charts: {},
    
    render() {
        this.renderDistributionChart();
        this.renderDepartmentChart();
        this.renderOptimizationSuggestions();
        this.updateROIMetrics();
    },
    
    renderDistributionChart() {
        const ctx = document.getElementById('distributionChart');
        if (!ctx) return;
        
        const durations = {
            'Short (≤30min)': 0,
            'Medium (30-60min)': 0,
            'Long (60-120min)': 0,
            'Very Long (>120min)': 0
        };
        
        appData.meetings.forEach(meeting => {
            if (meeting.duration <= 30) durations['Short (≤30min)']++;
            else if (meeting.duration <= 60) durations['Medium (30-60min)']++;
            else if (meeting.duration <= 120) durations['Long (60-120min)']++;
            else durations['Very Long (>120min)']++;
        });
        
        if (this.charts.distributionChart) {
            this.charts.distributionChart.destroy();
        }
        
        this.charts.distributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(durations),
                datasets: [{
                    data: Object.values(durations),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },
    
    renderDepartmentChart() {
        const ctx = document.getElementById('departmentChart');
        if (!ctx) return;
        
        const departments = {
            'Engineering': 35,
            'Marketing': 25,
            'Sales': 20,
            'Product': 15,
            'HR': 5
        };
        
        if (this.charts.departmentChart) {
            this.charts.departmentChart.destroy();
        }
        
        this.charts.departmentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(departments),
                datasets: [{
                    label: 'Cost by Department (%)',
                    data: Object.values(departments),
                    backgroundColor: '#1FB8CD',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    },
    
    renderOptimizationSuggestions() {
        const container = document.getElementById('optimizationList');
        if (!container) return;
        
        const suggestions = [
            { icon: '⚡', text: 'Reduce weekly standup from 30 to 15 minutes', savings: '$200/month' },
            { icon: '👥', text: 'Limit planning meetings to 6 participants', savings: '$150/month' },
            { icon: '📅', text: 'Schedule shorter review meetings (45 min)', savings: '$100/month' },
            { icon: '🎯', text: 'Use async updates for status meetings', savings: '$300/month' }
        ];
        
        container.innerHTML = suggestions.map(suggestion => `
            <div class="optimization-item">
                <div style="font-size: 1.5rem;">${suggestion.icon}</div>
                <div style="flex: 1;">
                    <div>${suggestion.text}</div>
                    <div style="color: var(--color-success); font-weight: bold; font-size: var(--font-size-sm);">
                        Potential savings: ${suggestion.savings}
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    updateROIMetrics() {
        const totalMeetings = appData.meetings.length;
        const highValue = Math.round((totalMeetings * 0.23));
        const mediumValue = Math.round((totalMeetings * 0.45));
        const lowValue = totalMeetings - highValue - mediumValue;
        
        document.querySelectorAll('.roi-item .roi-value').forEach((element, index) => {
            switch (index) {
                case 0:
                    element.textContent = `${highValue} (23%)`;
                    break;
                case 1:
                    element.textContent = `${mediumValue} (45%)`;
                    break;
                case 2:
                    element.textContent = `${lowValue} (32%)`;
                    break;
            }
        });
    }
};

// Pricing Module
const pricing = {
    isAnnual: false,
    selectedPlan: null,
    
    init() {
        this.setupEventListeners();
        this.updatePrices();
    },
    
    setupEventListeners() {
        const billingToggle = document.getElementById('billingToggle');
        if (billingToggle) {
            billingToggle.addEventListener('change', (e) => {
                this.isAnnual = e.target.checked;
                this.updatePrices();
            });
        }
    },
    
    selectPlan(planId) {
        this.selectedPlan = planId;
        navigation.showView('payment');
    },
    
    updatePrices() {
        const proPrice = document.getElementById('proPrice');
        const enterprisePrice = document.getElementById('enterprisePrice');
        
        const proPlan = appData.subscriptionPlans.find(p => p.id === 'pro');
        const enterprisePlan = appData.subscriptionPlans.find(p => p.id === 'enterprise');
        
        if (proPrice && proPlan) {
            const price = this.isAnnual ? Math.round(proPlan.price * 0.8) : proPlan.price;
            const period = this.isAnnual ? '/year' : '/month';
            proPrice.innerHTML = `$${price}<span>${period}</span>`;
        }
        
        if (enterprisePrice && enterprisePlan) {
            const price = this.isAnnual ? Math.round(enterprisePlan.price * 0.8) : enterprisePlan.price;
            const period = this.isAnnual ? '/year' : '/month';
            enterprisePrice.innerHTML = `$${price}<span>${period}</span>`;
        }
    }
};

// Payment Module
const payment = {
    selectedPaymentMethod: 'card',
    processingPayment: false,
    
    init() {
        this.renderPlanSummary();
        this.renderOrderSummary();
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
        const processBtn = document.getElementById('processPaymentBtn');
        
        paymentMethods.forEach(method => {
            method.addEventListener('change', (e) => {
                this.selectedPaymentMethod = e.target.value;
                this.toggleCardForm();
            });
        });
        
        if (processBtn) {
            processBtn.addEventListener('click', () => this.processPayment());
        }
        
        this.setupCardInputs();
    },
    
    toggleCardForm() {
        const cardForm = document.getElementById('cardForm');
        if (cardForm) {
            cardForm.style.display = this.selectedPaymentMethod === 'card' ? 'block' : 'none';
        }
    },
    
    setupCardInputs() {
        const cardNumber = document.getElementById('cardNumber');
        const cardExpiry = document.getElementById('cardExpiry');
        const cardCvc = document.getElementById('cardCvc');
        
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
            });
        }
        
        if (cardExpiry) {
            cardExpiry.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
            });
        }
        
        if (cardCvc) {
            cardCvc.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }
    },
    
    renderPlanSummary() {
        const container = document.getElementById('planSummary');
        if (!container || !pricing.selectedPlan) return;
        
        const plan = appData.subscriptionPlans.find(p => p.id === pricing.selectedPlan);
        if (!plan) return;
        
        const price = pricing.isAnnual ? Math.round(plan.price * 0.8) : plan.price;
        const period = pricing.isAnnual ? 'year' : 'month';
        
        container.innerHTML = `
            <h3>${plan.name} Plan</h3>
            <p class="plan-price">$${price}/${period}</p>
            <p>Perfect for ${plan.id === 'pro' ? 'growing teams' : 'large enterprises'}</p>
        `;
    },
    
    renderOrderSummary() {
        const container = document.getElementById('orderDetails');
        if (!container || !pricing.selectedPlan) return;
        
        const plan = appData.subscriptionPlans.find(p => p.id === pricing.selectedPlan);
        if (!plan) return;
        
        const basePrice = pricing.isAnnual ? plan.price * 12 : plan.price;
        const discount = pricing.isAnnual ? basePrice * 0.2 : 0;
        const subtotal = basePrice - discount;
        const tax = subtotal * 0.08;
        const total = subtotal + tax;
        
        container.innerHTML = `
            <div class="order-line" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>${plan.name} Plan (${pricing.isAnnual ? 'Annual' : 'Monthly'})</span>
                <span>$${basePrice.toFixed(2)}</span>
            </div>
            ${pricing.isAnnual ? `
                <div class="order-line" style="display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--color-success);">
                    <span>Annual Discount (20%)</span>
                    <span>-$${discount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="order-line" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Tax (8%)</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="order-line" style="display: flex; justify-content: space-between; border-top: 1px solid var(--color-border); font-weight: bold; padding-top: 8px; margin-top: 8px;">
                <span>Total</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        `;
    },
    
    async processPayment() {
        if (this.processingPayment) return;
        
        const cardNumber = document.getElementById('cardNumber');
        const cardExpiry = document.getElementById('cardExpiry');
        const cardCvc = document.getElementById('cardCvc');
        const cardName = document.getElementById('cardName');
        
        if (this.selectedPaymentMethod === 'card') {
            if (!cardNumber?.value || !cardExpiry?.value || !cardCvc?.value || !cardName?.value) {
                toast.error('Please fill in all payment details.');
                return;
            }
        }
        
        this.processingPayment = true;
        const processBtn = document.getElementById('processPaymentBtn');
        
        if (processBtn) {
            processBtn.classList.add('btn--processing');
            processBtn.disabled = true;
        }
        
        toast.info('Processing payment...', 3000);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            appData.currentPlan = pricing.selectedPlan;
            if (appData.user) {
                appData.user.plan = pricing.selectedPlan;
            }
            
            auth.updateUI();
            
            toast.success('Payment successful! Welcome to your new plan.');
            
            setTimeout(() => {
                navigation.showView('dashboard');
            }, 2000);
            
        } catch (error) {
            toast.error('Payment failed. Please try again.');
        } finally {
            this.processingPayment = false;
            if (processBtn) {
                processBtn.classList.remove('btn--processing');
                processBtn.disabled = false;
            }
        }
    }
};

// Settings Module
const settings = {
    currentTab: 'general',
    
    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.populateCurrencies();
    },
    
    setupEventListeners() {
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.getAttribute('data-tab'));
            });
        });
        
        const forms = ['settingsForm', 'currencyForm', 'notificationsForm'];
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                form.addEventListener('submit', (e) => this.saveSettings(e, formId));
            }
        });
    },
    
    switchTab(tabName) {
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            }
        });
        
        document.querySelectorAll('.settings-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}Panel`)?.classList.add('active');
        
        this.currentTab = tabName;
    },
    
    loadSettings() {
        const defaultRate = document.getElementById('defaultRate');
        const defaultParticipants = document.getElementById('defaultParticipants');
        const workingHours = document.getElementById('workingHours');
        
        if (defaultRate) defaultRate.value = appData.settings.defaultHourlyRate;
        if (defaultParticipants) defaultParticipants.value = appData.settings.defaultParticipants;
        if (workingHours) workingHours.value = appData.settings.workingHoursPerDay;
    },
    
    populateCurrencies() {
        const select = document.getElementById('primaryCurrency');
        const grid = document.getElementById('currencyGrid');
        
        if (select) {
            select.innerHTML = '';
            appData.currencies.forEach(currency => {
                select.innerHTML += `<option value="${currency.code}">${currency.name} (${currency.symbol})</option>`;
            });
            select.value = appData.settings.currency;
        }
        
        if (grid) {
            grid.innerHTML = '';
            appData.currencies.slice(0, 6).forEach(currency => {
                const isChecked = appData.settings.favoriteCurrencies.includes(currency.code) ? 'checked' : '';
                grid.innerHTML += `
                    <label class="checkbox-label">
                        <input type="checkbox" value="${currency.code}" ${isChecked}>
                        <span>${currency.code}</span>
                    </label>
                `;
            });
        }
    },
    
    saveSettings(e, formId) {
        e.preventDefault();
        
        switch (formId) {
            case 'settingsForm':
                appData.settings.defaultHourlyRate = parseFloat(document.getElementById('defaultRate').value);
                appData.settings.defaultParticipants = parseInt(document.getElementById('defaultParticipants').value);
                appData.settings.workingHoursPerDay = parseInt(document.getElementById('workingHours').value);
                break;
                
            case 'currencyForm':
                appData.settings.currency = document.getElementById('primaryCurrency').value;
                const checkedCurrencies = Array.from(document.querySelectorAll('#currencyGrid input:checked'))
                    .map(input => input.value);
                appData.settings.favoriteCurrencies = checkedCurrencies.length > 0 ? checkedCurrencies : ['USD', 'EUR', 'GBP'];
                break;
        }
        
        toast.success('Settings saved successfully!');
    }
};

// Profile Module
const profile = {
    init() {
        this.loadProfileData();
        this.setupEventListeners();
    },
    
    loadProfileData() {
        if (!appData.user) return;
        
        const firstName = document.getElementById('profileFirstName');
        const lastName = document.getElementById('profileLastName');
        const email = document.getElementById('profileEmail');
        const company = document.getElementById('profileCompany');
        
        if (firstName) firstName.value = appData.user.firstName || '';
        if (lastName) lastName.value = appData.user.lastName || '';
        if (email) email.value = appData.user.email || '';
        if (company) company.value = appData.user.company || '';
    },
    
    setupEventListeners() {
        const profileForm = document.getElementById('profileForm');
        const passwordForm = document.getElementById('passwordForm');
        
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                if (appData.user) {
                    appData.user.firstName = document.getElementById('profileFirstName').value;
                    appData.user.lastName = document.getElementById('profileLastName').value;
                    appData.user.company = document.getElementById('profileCompany').value;
                    
                    appData.user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(appData.user.firstName + ' ' + appData.user.lastName)}&background=1FB8CD&color=fff`;
                    
                    auth.updateUI();
                }
                
                toast.success('Profile updated successfully!');
            });
        }
        
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const current = document.getElementById('currentPassword').value;
                const newPass = document.getElementById('newPassword').value;
                const confirm = document.getElementById('confirmPassword').value;
                
                if (!current || !newPass || !confirm) {
                    toast.error('Please fill in all password fields.');
                    return;
                }
                
                if (newPass !== confirm) {
                    toast.error('New passwords do not match.');
                    return;
                }
                
                if (newPass.length < 6) {
                    toast.error('Password must be at least 6 characters long.');
                    return;
                }
                
                passwordForm.reset();
                toast.success('Password changed successfully!');
            });
        }
    }
};

// Billing Module
const billing = {
    render() {
        this.updateCurrentPlan();
        this.renderPaymentMethods();
        this.renderBillingHistory();
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        const changePlanBtn = document.getElementById('changePlanBtn');
        const cancelPlanBtn = document.getElementById('cancelPlanBtn');
        const addPaymentBtn = document.getElementById('addPaymentMethodBtn');
        
        if (changePlanBtn) {
            changePlanBtn.addEventListener('click', () => {
                navigation.showView('pricing');
            });
        }
        
        if (cancelPlanBtn) {
            cancelPlanBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
                    appData.currentPlan = 'free';
                    if (appData.user) {
                        appData.user.plan = 'free';
                    }
                    auth.updateUI();
                    toast.success('Subscription cancelled successfully.');
                    this.updateCurrentPlan();
                }
            });
        }
        
        if (addPaymentBtn) {
            addPaymentBtn.addEventListener('click', () => {
                toast.info('Payment method management coming soon!');
            });
        }
    },
    
    updateCurrentPlan() {
        const plan = appData.subscriptionPlans.find(p => p.id === appData.currentPlan);
        if (plan) {
            const planNameEl = document.getElementById('currentPlanName');
            const planPriceEl = document.getElementById('currentPlanPrice');
            
            if (planNameEl) planNameEl.textContent = `${plan.name} Plan`;
            if (planPriceEl) {
                if (plan.price === 0) {
                    planPriceEl.textContent = 'Free';
                } else {
                    planPriceEl.textContent = `$${plan.price}.00/month`;
                }
            }
        }
    },
    
    renderPaymentMethods() {
        const container = document.getElementById('paymentMethodsList');
        if (!container) return;
        
        if (appData.currentPlan === 'free') {
            container.innerHTML = `
                <div style="text-align: center; padding: 32px; color: var(--color-text-secondary);">
                    <p>No payment methods needed for the free plan.</p>
                    <button class="btn btn--primary" data-view="pricing">Upgrade Plan</button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="payment-method-item" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border: 1px solid var(--color-border); border-radius: var(--radius-base); margin-bottom: 12px;">
                    <div>
                        <div style="font-weight: var(--font-weight-semibold);">•••• •••• •••• 1234</div>
                        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">Visa • Expires 12/2027</div>
                    </div>
                    <div>
                        <span class="status status--success">Default</span>
                    </div>
                </div>
            `;
        }
    },
    
    renderBillingHistory() {
        const container = document.getElementById('billingHistoryList');
        if (!container) return;
        
        if (appData.currentPlan === 'free') {
            container.innerHTML = `
                <div style="text-align: center; padding: 32px; color: var(--color-text-secondary);">
                    <p>No billing history for free plan.</p>
                </div>
            `;
        } else {
            const today = new Date();
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            const plan = appData.subscriptionPlans.find(p => p.id === appData.currentPlan);
            
            container.innerHTML = `
                <div class="billing-item" style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--color-border);">
                    <div>
                        <div style="font-weight: var(--font-weight-semibold);">${plan.name} Plan</div>
                        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${lastMonth.toLocaleDateString()}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: var(--font-weight-bold);">$${plan.price}.00</div>
                        <div style="font-size: var(--font-size-sm);">
                            <a href="#" style="color: var(--color-primary);" onclick="toast.success('PDF download feature coming soon!')">Download PDF</a>
                        </div>
                    </div>
                </div>
            `;
        }
    }
};

// Form Handlers
const forms = {
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            toast.error('Please fill in all fields.');
            return;
        }
        
        try {
            await auth.login(email, password);
            navigation.showView('dashboard');
        } catch (error) {
            toast.error('Login failed. Please try again.');
        }
    },
    
    async handleSignup(e) {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const company = document.getElementById('company').value;
        
        if (!firstName || !lastName || !email || !password) {
            toast.error('Please fill in all required fields.');
            return;
        }
        
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long.');
            return;
        }
        
        try {
            await auth.signup({ firstName, lastName, email, password, company });
            navigation.showView('calculator');
        } catch (error) {
            toast.error('Signup failed. Please try again.');
        }
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - initializing MeetingCost Pro');
    
    toast.init();
    navigation.init();
    auth.updateUI();
    
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', forms.handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', forms.handleSignup);
    }
    
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const googleSignUpBtn = document.getElementById('googleSignUpBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', async () => {
            try {
                await auth.googleAuth();
                navigation.showView('dashboard');
            } catch (error) {
                toast.error('Google authentication failed.');
            }
        });
    }
    
    if (googleSignUpBtn) {
        googleSignUpBtn.addEventListener('click', async () => {
            try {
                await auth.googleAuth();
                navigation.showView('calculator');
            } catch (error) {
                toast.error('Google authentication failed.');
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.logout();
        });
    }
    
    setTimeout(() => {
        toast.info('Welcome to MeetingCost Pro! Try our free calculator or explore our features.', 5000);
    }, 2000);
    
    console.log('MeetingCost Pro initialized successfully');
});

// Make key functions globally accessible
window.navigation = navigation;
window.toast = toast;
window.utils = utils;
window.exportManager = exportManager;
window.pricing = pricing;