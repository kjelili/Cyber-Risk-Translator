import { useState } from 'react';
import { useApp } from './context';
import { NAV_GROUPS } from '../shared/config';
import { cn } from '../shared/lib/utils';
import { Button } from '../shared/ui';
import type { Route } from '../shared/types';

export function Layout({ children }: { children: React.ReactNode }) {
  const { route, projectId, projectName, navigate } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (route === 'landing') return <>{children}</>;

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface-secondary transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          {!collapsed && (
            <button onClick={() => navigate('landing')} className="text-lg font-bold text-accent transition-colors hover:text-accent-light">
            CROC
          </button>
          )}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="rounded p-1 text-content-tertiary hover:text-content-primary hover:bg-surface-tertiary transition-colors"
            aria-label="Toggle sidebar"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Project indicator */}
        {!collapsed && (
          <div className="border-b border-border px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-content-tertiary">Project</div>
            <div className="truncate text-sm font-medium text-content-primary">
              {projectId ? `#${projectId} ${projectName}` : 'None selected'}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-content-tertiary">
                  {group.label}
                </div>
              )}
              {group.items.map(item => {
                const disabled = item.requiresProject && !projectId;
                const active = route === item.route;
                return (
                  <button
                    key={item.route}
                    disabled={disabled}
                    onClick={() => { navigate(item.route as Route); setMobileOpen(false); }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150',
                      active
                        ? 'bg-accent/10 text-accent font-medium'
                        : 'text-content-secondary hover:bg-surface-tertiary hover:text-content-primary',
                      disabled && 'opacity-40 cursor-not-allowed',
                      collapsed && 'justify-center',
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="text-base">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t border-border px-4 py-3">
            <div className="text-[10px] text-content-tertiary">Cybersecurity Risk Operation Centre v1.0</div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className={cn(
        'flex-1 transition-all duration-300',
        collapsed ? 'md:ml-16' : 'md:ml-64',
      )}>
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface-primary/90 px-4 py-3 backdrop-blur-sm md:hidden">
          <button onClick={() => setMobileOpen(true)} className="text-lg" aria-label="Open menu">☰</button>
          <span className="font-semibold text-accent">CROC</span>
        </div>
        <div className="animate-fade-in p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
