/// <reference types="@webgpu/types" />

const STORAGE_KEY = 'bhSim_dismissedIGPUWarning';

export function shouldWarnIntegratedGPU(adapter: GPUAdapter): boolean {
  // Check if previously dismissed
  if (localStorage.getItem(STORAGE_KEY) === 'true') {
    return false;
  }

  const info = (adapter as GPUAdapter & { info?: { vendor?: string; description?: string; device?: string; architecture?: string } }).info;
  if (info) {
    const vendor = (info.vendor || '').toLowerCase();
    const description = (info.description || '').toLowerCase();

    // If clearly NVIDIA or AMD, usually dGPU.
    // (Note: AMD APUs exist, but "amd" + heavy task is often better than Intel iGPU.
    // Logic can be refined. Requirement says: "if nvidia or amd, consider dGPU")
    if (vendor.includes('nvidia') || vendor.includes('amd')) {
      return false;
    }

    // Intel is almost always integrated (except Arc dGPU which are rarer).
    // Requirement: treat vendor "intel" or description "Intel" as iGPU fallback.
    if (vendor.includes('intel') || description.includes('intel')) {
      return true;
    }
  }

  // Fallback heuristics if info unavailable or inconclusive
  // Heuristic: Small maxStorageBufferBindingSize is often a sign of limits on mobile/iGPU
  // (Standard dGPU usually 128MB+ or substantially large. 128MB = 134217728)
  // Let's use a conservative check.
  const limits = adapter.limits;

  // Example heuristic:
  // If maxStorageBufferBindingSize is surprisingly small (e.g. < 128MB) it MIGHT be iGPU-ish
  // but let's stick to the "Intel" text check as primary.
  // Requirement: "fallback to a heuristic using limits... keep it simple".

  // A common discriminator is maxComputeWorkgroupStorageSize.
  // 16KB (16384) is min spec. High end dGPUs often have 32KB or 64KB, but not reliably.

  // Let's check maxBufferSize? No.

  // If we found NO vendor info, rely on the fact that High Performance usually gives dGPU.
  // If we are here, we didn't match nvidia/amd/intel.

  // Let's try: if limits.maxStorageBufferBindingSize < 128MB, warn.
  if (limits.maxStorageBufferBindingSize < 128 * 1024 * 1024) {
    return true;
  }

  return false;
}

export function showIntegratedGPUWarning(adapterInfo: { vendor?: string; description?: string; device?: string; architecture?: string } | undefined) {
  // Create Banner
  const banner = document.createElement('div');
  Object.assign(banner.style, {
    position: 'fixed',
    bottom: '0',
    left: '0',
    width: '100%',
    backgroundColor: '#330000', // Dark red info
    color: '#ffffff',
    padding: '12px 20px',
    zIndex: '99999',
    fontFamily: 'sans-serif',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    boxSizing: 'border-box',
  });

  const textContainer = document.createElement('div');

  const title = document.createElement('div');
  title.textContent = 'Performance Warning: Integrated GPU Detected';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '4px';

  const desc = document.createElement('div');
  desc.style.fontSize = '0.9em';
  desc.style.opacity = '0.9';
  desc.innerHTML = `Your browser is using the integrated GPU (${adapterInfo?.device || adapterInfo?.description || 'Unknown'
  }). Performance will be poor. <span id="gpu-help-link" style="text-decoration: underline; cursor: pointer; color: #ffcccc;">How to fix?</span>`;

  textContainer.appendChild(title);
  textContainer.appendChild(desc);

  const dismissBtn = document.createElement('button');
  dismissBtn.textContent = 'Dismiss';
  Object.assign(dismissBtn.style, {
    background: 'transparent',
    border: '1px solid #ffffff',
    color: '#ffffff',
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '0.85em',
    whiteSpace: 'nowrap',
  });

  dismissBtn.onclick = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    banner.remove();
  };

  banner.appendChild(textContainer);
  banner.appendChild(dismissBtn);

  // Mount to body (or app root if preferred, body is safest fallback)
  document.body.appendChild(banner);

  // Modal Logic
  const helpLink = banner.querySelector('#gpu-help-link') as HTMLElement;
  if (helpLink) {
    helpLink.onclick = () => {
      showHelpModal();
    };
  }
}

function showHelpModal() {
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: '100000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  });

  const modal = document.createElement('div');
  Object.assign(modal.style, {
    backgroundColor: '#1a1a1a',
    color: '#eee',
    padding: '24px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    fontFamily: 'sans-serif',
    boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
  });

  modal.innerHTML = `
    <h2 style="margin-top:0; color: #ff6666;">Switch to High Performance GPU</h2>
    <p style="line-height: 1.5;">
      Windows often defaults browsers to the "Power Saving" integrated GPU. To get full performance:
    </p>
    <ol style="line-height: 1.6; padding-left: 20px;">
      <li>Open Windows <strong>Settings</strong></li>
      <li>Go to <strong>System</strong> → <strong>Display</strong> → <strong>Graphics</strong></li>
      <li>Under "Custom options for apps", ensure your browser (Chrome/Edge) is added. (If not, click "Add an app", select "Desktop app", and browse to the executable).</li>
      <li>Click on the browser, select <strong>Options</strong>.</li>
      <li>Choose <strong>High performance</strong> (e.g. NVIDIA/AMD) and click <strong>Save</strong>.</li>
    </ol>
    <p style="font-weight: bold; margin-top: 16px;">
      IMPORTANT: You must fully quit and relaunch your browser for this to take effect.
    </p>
    <div style="text-align: right; margin-top: 24px;">
      <button id="close-gpu-modal" style="
        padding: 8px 16px; 
        background-color: #444; 
        color: white; 
        border: none; 
        border-radius: 4px; 
        cursor: pointer;
      ">Close</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const closeBtn = modal.querySelector('#close-gpu-modal') as HTMLElement;
  closeBtn.onclick = () => {
    overlay.remove();
  };

  // Close on background click
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };
}
