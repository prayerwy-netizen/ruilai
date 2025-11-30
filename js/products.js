/* 产品页面脚本 */
document.addEventListener('DOMContentLoaded', () => {
  // Tab切换
  const tabs = document.querySelectorAll('.tab-item');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none';
      });

      tab.classList.add('active');
      contents[index].classList.add('active');
      contents[index].style.display = 'block';
    });
  });
});
