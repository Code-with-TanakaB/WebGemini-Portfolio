// Circular progress bar for skills
function createCircularProgressBar(container, percent, label, color) {
  const size = 110;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = percent / 100 * circumference;
  container.innerHTML = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${radius}" stroke="#eee" stroke-width="${strokeWidth}" fill="none" />
      <circle cx="${size/2}" cy="${size/2}" r="${radius}" stroke="${color}" stroke-width="${strokeWidth}"
        fill="none" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference - progress}"
        style="transition: stroke-dashoffset 1.2s;" />
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-size="1.2rem" fill="#222">${percent}%</text>
    </svg>
    <div class="circular-label">${label}</div>
  `;
}

document.addEventListener('DOMContentLoaded', function() {
  const skills = [
    { label: 'JavaScript', percent: 95, color: '#f7df1e' },
    { label: 'HTML', percent: 90, color: '#e34c26' },
    { label: 'CSS', percent: 88, color: '#2965f1' },
    { label: 'React.js', percent: 85, color: '#61dafb' },
    { label: '3D Web', percent: 80, color: '#00c3ff' }
  ];
  const barsContainer = document.getElementById('skills-circular-bars');
  if (barsContainer) {
    skills.forEach(skill => {
      const bar = document.createElement('div');
      bar.className = 'circular-bar';
      createCircularProgressBar(bar, skill.percent, skill.label, skill.color);
      barsContainer.appendChild(bar);
    });
  }
});
