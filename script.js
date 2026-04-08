// ==================== LIVE TV CORE ====================
(function() {
    const SERVERS = [
        {
            id: 0,
            name: 'Mirraby Stream',
            url: 'https://web.mswott.net/p?url=https%3A%2F%2Fmirraby.mswott.top%2FMSW%2FNai%2Fkhai%2Ffaka.php&__src=https%3A%2F%2Fmirraby.mswott.top%2FMSW%2FNai%2Fkhai%2Ffaka.php&__type=document',
            icon: 'fa-play-circle',
            quality: 'HD 1080p'
        },
        {
            id: 1,
            name: 'Ash TV Bangladesh',
            url: 'https://web.mswott.net/p?url=http%3A%2F%2F103.144.89.251%2F&__src=http%3A%2F%2F103.144.89.251%2F&__type=document',
            icon: 'fa-tower-broadcast',
            quality: 'HD Live'
        }
    ];

    let activeServerId = 0;
    let isLoading = false;
    const playerFrame = document.getElementById('livePlayerIframe');
    const channelGrid = document.getElementById('channelGrid');
    const tabButtons = document.querySelectorAll('.server-tab-btn');

    function showToast(message, type = 'success') {
        let existingToast = document.querySelector('.toast-message');
        if (existingToast) existingToast.remove();
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
        toast.innerHTML = `<i class="fas ${icon}" style="margin-right: 8px; color: #00C4B4;"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    function loadStream(serverId) {
        if (isLoading) return;
        
        const targetServer = SERVERS.find(s => s.id === serverId);
        if (!targetServer || !playerFrame) return;
        
        isLoading = true;
        
        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        loadingDiv.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Loading stream...';
        loadingDiv.style.position = 'absolute';
        loadingDiv.style.top = '50%';
        loadingDiv.style.left = '50%';
        loadingDiv.style.transform = 'translate(-50%, -50%)';
        loadingDiv.style.zIndex = '10';
        loadingDiv.style.background = 'rgba(0,0,0,0.7)';
        loadingDiv.style.padding = '8px 16px';
        loadingDiv.style.borderRadius = '20px';
        loadingDiv.style.fontSize = '12px';
        loadingDiv.style.color = '#00C4B4';
        
        const parent = playerFrame.parentElement;
        parent.style.position = 'relative';
        parent.appendChild(loadingDiv);
        
        // Load the stream
        playerFrame.src = targetServer.url;
        
        // Remove loading indicator after timeout
        setTimeout(() => {
            if (loadingDiv && loadingDiv.parentNode) {
                loadingDiv.remove();
            }
            isLoading = false;
            showToast(`Now playing: ${targetServer.name}`, 'success');
        }, 1500);
    }

    function switchServer(serverId, updateUI = true) {
        const targetServer = SERVERS.find(s => s.id === serverId);
        if (!targetServer) return;
        
        activeServerId = serverId;
        loadStream(serverId);
        
        if (updateUI) {
            tabButtons.forEach(btn => {
                const btnId = parseInt(btn.getAttribute('data-server'), 10);
                if (btnId === serverId) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            document.querySelectorAll('.channel-card').forEach(card => {
                const cardServerId = parseInt(card.getAttribute('data-server-id'), 10);
                if (cardServerId === serverId) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        }
    }

    function buildChannelList() {
        if (!channelGrid) return;
        channelGrid.innerHTML = '';
        
        SERVERS.forEach(server => {
            const isActive = (server.id === activeServerId);
            const card = document.createElement('div');
            card.className = `channel-card ${isActive ? 'active' : ''}`;
            card.setAttribute('data-server-id', server.id);
            card.innerHTML = `
                <div class="channel-icon"><i class="fas ${server.icon}"></i></div>
                <div class="channel-name">${escapeHtml(server.name)}</div>
                <div class="channel-status"><i class="fas fa-circle" style="font-size: 7px; color:#30E3A0;"></i> LIVE</div>
                <span class="channel-badge">${escapeHtml(server.quality)}</span>
            `;
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                switchServer(server.id, true);
            });
            channelGrid.appendChild(card);
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function initTabs() {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const serverVal = parseInt(btn.getAttribute('data-server'), 10);
                if (!isNaN(serverVal)) {
                    switchServer(serverVal, true);
                }
            });
        });
    }

    function ensureScrollBehavior() {
        const scrollWrap = document.getElementById('channelScrollWrapper');
        if (scrollWrap) {
            scrollWrap.style.scrollBehavior = 'smooth';
            setTimeout(() => {
                const activeCard = document.querySelector('.channel-card.active');
                if (activeCard && scrollWrap) {
                    activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }, 200);
        }
    }

    function enhanceIframeReliability() {
        if (!playerFrame) return;
        
        // Reload iframe on visibility change (improves stability)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && playerFrame.src && playerFrame.src !== 'about:blank') {
                const currentServer = SERVERS.find(s => s.id === activeServerId);
                if (currentServer) {
                    // Small refresh to keep stream alive
                    setTimeout(() => {
                        if (playerFrame.src !== currentServer.url) {
                            playerFrame.src = currentServer.url;
                        }
                    }, 100);
                }
            }
        });
    }

    function attachFullscreenSupport() {
        const wrapper = document.querySelector('.player-wrapper');
        if (wrapper) {
            wrapper.addEventListener('dblclick', () => {
                const iframe = document.getElementById('livePlayerIframe');
                if (iframe && iframe.requestFullscreen) {
                    iframe.requestFullscreen().catch(err => {
                        if (wrapper.requestFullscreen) wrapper.requestFullscreen();
                    });
                } else if (wrapper.requestFullscreen) {
                    wrapper.requestFullscreen();
                }
            });
        }
    }

    function initLiveTV() {
        buildChannelList();
        initTabs();
        ensureScrollBehavior();
        attachFullscreenSupport();
        enhanceIframeReliability();
        
        // Auto-load first server
        if (playerFrame && SERVERS[0]) {
            setTimeout(() => {
                loadStream(activeServerId);
            }, 500);
        }
        
        // Handle window resize for scroll position
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const activeCardNow = document.querySelector('.channel-card.active');
                const scrollContainer = document.getElementById('channelScrollWrapper');
                if (activeCardNow && scrollContainer) {
                    activeCardNow.scrollIntoView({ behavior: 'smooth', inline: 'center' });
                }
            }, 150);
        });
        
        // Handle responsive sidebar position
        function handleSidebarPosition() {
            const sidebar = document.querySelector('.sidebar-section-wrapper');
            if (sidebar) {
                if (window.innerWidth < 1024) {
                    sidebar.style.position = 'relative';
                    sidebar.style.right = 'auto';
                    sidebar.style.top = 'auto';
                    sidebar.style.width = 'auto';
                    sidebar.style.margin = '20px auto 0';
                } else {
                    sidebar.style.position = 'fixed';
                    sidebar.style.right = '20px';
                    sidebar.style.top = '100px';
                    sidebar.style.width = '320px';
                    sidebar.style.margin = '0';
                }
            }
        }
        
        window.addEventListener('resize', handleSidebarPosition);
        handleSidebarPosition();
        
        // Simulate live viewers count updater
        setInterval(() => {
            const viewerSpan = document.getElementById('viewerCount');
            if (viewerSpan) {
                let curr = parseInt(viewerSpan.innerText.replace(/,/g, '')) || 1284;
                let change = Math.floor(Math.random() * 15) - 5;
                let newVal = Math.max(800, curr + change);
                viewerSpan.innerText = newVal.toLocaleString();
            }
        }, 30000);
        
        showToast('Welcome to HD4STATION Live TV!', 'info');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLiveTV);
    } else {
        initLiveTV();
    }
})();

// ========== SOCIAL SHARE FUNCTIONALITY ==========
(function() {
    // Social share functionality
    const currentUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent("Watch HD4STATION Live TV - Free HD Streams!");
    
    const fbShare = document.getElementById('fbShare');
    const twShare = document.getElementById('twShare');
    const waShare = document.getElementById('waShare');
    const shareTwitter = document.getElementById('shareTwitter');
    const shareWhatsApp = document.getElementById('shareWhatsApp');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    
    if (fbShare) {
        fbShare.addEventListener('click', () => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`, '_blank');
        });
    }
    
    if (twShare) {
        twShare.addEventListener('click', () => {
            window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${currentUrl}`, '_blank');
        });
    }
    
    if (waShare) {
        waShare.addEventListener('click', () => {
            window.open(`https://wa.me/?text=${shareText}%20${currentUrl}`, '_blank');
        });
    }
    
    if (shareTwitter) {
        shareTwitter.addEventListener('click', () => {
            window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${currentUrl}`, '_blank');
        });
    }
    
    if (shareWhatsApp) {
        shareWhatsApp.addEventListener('click', () => {
            window.open(`https://wa.me/?text=${shareText}%20${currentUrl}`, '_blank');
        });
    }
    
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                const toastMsg = document.createElement('div');
                toastMsg.className = 'toast-message';
                toastMsg.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 8px; color:#00C4B4;"></i> Link copied to clipboard!';
                document.body.appendChild(toastMsg);
                setTimeout(() => toastMsg.remove(), 2000);
            }).catch(() => {
                const toastMsg = document.createElement('div');
                toastMsg.className = 'toast-message';
                toastMsg.innerHTML = '<i class="fas fa-exclamation-circle" style="margin-right: 8px; color:#FF4D4D;"></i> Failed to copy link';
                document.body.appendChild(toastMsg);
                setTimeout(() => toastMsg.remove(), 2000);
            });
        });
    }
    
    console.log("HD4STATION Live TV - Ready");
})();