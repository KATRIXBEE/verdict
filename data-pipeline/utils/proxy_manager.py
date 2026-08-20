"""
Proxy Manager
Rotates proxy servers with automated failover and 60-minute cooling period.
"""

import time
from typing import Optional, List, Dict


class ProxyManager:
    """
    Manages a pool of HTTP/HTTPS proxies with round-robin rotation and cooldown on failure.
    """

    def __init__(self, proxy_list: Optional[List[str]] = None, cooldown_seconds: int = 3600):
        self.proxies = [p.strip() for p in (proxy_list or []) if p.strip()]
        self.cooldown_seconds = cooldown_seconds
        self.failed_proxies: Dict[str, float] = {}  # proxy -> failure_timestamp
        self._index = 0

    def get_proxy(self) -> Optional[str]:
        """
        Get the next available proxy in round-robin rotation.
        Returns None if no proxies are configured or all are in cooldown.
        """
        if not self.proxies:
            return None

        now = time.time()
        # Restore cooled-down proxies
        expired_fails = [p for p, t in self.failed_proxies.items() if now - t >= self.cooldown_seconds]
        for p in expired_fails:
            del self.failed_proxies[p]

        # Filter active proxies
        active_proxies = [p for p in self.proxies if p not in self.failed_proxies]
        if not active_proxies:
            return None

        self._index = self._index % len(active_proxies)
        proxy = active_proxies[self._index]
        self._index = (self._index + 1) % len(active_proxies)
        return proxy

    def mark_failed(self, proxy: Optional[str]) -> None:
        """
        Mark a proxy as failed and place it on cooldown.
        """
        if proxy and proxy in self.proxies:
            self.failed_proxies[proxy] = time.time()
