/* Demo页面脚本 */
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.demo-tab');
  const panels = document.querySelectorAll('.demo-panel');

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.style.display = 'none');
      tab.classList.add('active');
      panels[index].style.display = 'block';
    });
  });
});

function calculateROI() {
  const output = document.getElementById('output').value;
  const workers = document.getElementById('workers').value;
  const accidents = document.getElementById('accidents').value;

  // 简单计算逻辑
  const costSaving = accidents * 64; // 每次事故平均成本64万
  const laborSaving = workers * 0.15; // 人力成本节约15%
  const paybackMonths = Math.floor(12 / (costSaving / 100));

  document.querySelector('.roi-result').style.display = 'block';
  Toast.show('ROI计算完成', 'success');
}
