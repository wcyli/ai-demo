document.addEventListener('DOMContentLoaded', () => {
    const levelDisplay = document.getElementById('level');
    const gameBoard = document.getElementById('game-board');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const resetBtn = document.getElementById('reset-btn'); // 获取重置按钮
    const scoreDisplay = document.getElementById('score'); // 获取总分显示元素
    const iconInput = document.getElementById('icon-input'); // 获取输入框
    let currentLevel = 1;
    let icon; // 声明图标变量
    let levelPositions = []; // 存储关卡位置
    let levelNames = [ // 添加关卡名称数组
        '新手启航', '初探秘境', '青云直上', '星辰之谜', '月光之舞',
        '神秘森林', '幽谷之歌', '灵幻之境', '星辰之旅', '梦幻迷宫',
        '星辰之海', '梦幻森林', '神秘花园', '星辰之塔', '幻境之门',
        '星辰之桥', '梦幻之境', '星辰之梦', '神秘之境', '星辰之光'
    ];
    let levelTimes = []; // 存储每个关卡完成的时间
    let totalScore = 0; // 总分
    let iconBase64 = localStorage.getItem('iconBase64') || 'p.png'; // 从本地存储中获取图片

    // 假设我们已经通过某种方式获取了关卡位置，这里直接定义一个示例数组
    levelPositions = [
        { top: 100, left: 55 }, { top: 252, left: 56 }, { top: 366, left: 45 }, { top: 440, left: 102 }, { top: 305, left: 168 },
        { top: 170, left: 164 }, { top: 52, left: 253 }, { top: 45, left: 470 }, { top: 153, left: 523 }, { top: 190, left: 330 },
        { top: 360, left: 272 }, { top: 450, left: 338 }, { top: 297, left: 476 }, { top: 450, left: 592 }, { top: 245, left: 658 },
        { top: 100, left: 672 }, { top: 51, left: 834 }, { top: 175, left: 854 }, { top: 326, left: 776 }, { top: 376, left: 920 }
    ];

    const fireworksCanvas = document.getElementById('fireworks-canvas');
    const fireworksCtx = fireworksCanvas.getContext('2d');
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;

    function startGame() {
        loadLevelData();
        renderLevel(); // 确保在游戏开始时调用 renderLevel
        nextLevelBtn.disabled = false; // 启用按钮
    }

    function renderLevel() {
        // 创建可移动的图标
        createMovableIcon();
        // 设置图标到当前关卡位置
        if (levelPositions[currentLevel - 1]) {
            icon.style.top = `${levelPositions[currentLevel - 1].top}px`;
            icon.style.left = `${levelPositions[currentLevel - 1].left}px`;
        }
        levelDisplay.textContent = `第${currentLevel}关：${levelNames[currentLevel - 1]}`; // 更新关卡显示和名称
        scoreDisplay.textContent = `总分：${totalScore}`; // 更新总分显示
    }

    function createMovableIcon() {
        if (icon) {
            gameBoard.removeChild(icon);
        }
        icon = document.createElement('img');
        icon.src = iconBase64; // 使用Base64图片
        icon.className = 'movable-icon';
        icon.style.position = 'absolute';
        gameBoard.appendChild(icon);

        let isDragging = false;
        let offsetX, offsetY;

        // icon.addEventListener('mousedown', (e) => {
        //     isDragging = true;
        //     offsetX = e.clientX - icon.offsetLeft;
        //     offsetY = e.clientY - icon.offsetTop;
        // });

        // document.addEventListener('mousemove', (e) => {
        //     if (isDragging) {
        //         icon.style.left = `${e.clientX - offsetX}px`;
        //         icon.style.top = `${e.clientY - offsetY}px`;
        //     }
        // });

        // document.addEventListener('mouseup', () => {
        //     isDragging = false;
        // });
    }

    nextLevelBtn.addEventListener('click', () => {
        nextLevelBtn.disabled = true; // 立即禁用按钮
        const startTime = performance.now(); // 记录开始时间
        animateMove(icon, levelPositions[currentLevel - 1], levelPositions[currentLevel], () => {
            const endTime = performance.now(); // 记录结束时间
            const duration = (endTime - startTime) / 1000; // 计算持续时间（秒）
            levelTimes[currentLevel] = duration; // 保存当前关卡完成时间

            // 新增：记录当前关卡的时间和积分
            if (currentLevel <= levelPositions.length) {
                const currentTime = new Date();
                const formattedTime = currentTime.toISOString().slice(0, 19).replace('T', ' '); // 格式化时间为 YYYY-MM-DD HH:mm:ss
                let rewardPoints = 3; // 初始化固定奖励积分

                const levelTimeItem2 = document.createElement('div');
                levelTimeItem2.textContent = `第${currentLevel}关: [${formattedTime}]，奖励${rewardPoints}积分`; // 添加奖励积分信息
                document.getElementById('level-times').appendChild(levelTimeItem2);

                if ([5, 10, 15, 19].includes(currentLevel)) {
                    const extraReward = Math.floor(Math.random() * 3) + 1; // 额外随机奖励1到3积分
                    rewardPoints += extraReward;
                    const extraRewardItem = document.createElement('div');
                    extraRewardItem.textContent = `因你连续完成通关额外奖励${extraReward}积分`;
                    document.getElementById('level-times').appendChild(extraRewardItem);
                }

                totalScore += rewardPoints; // 增加随机奖励积分
                scoreDisplay.textContent = `总分：${totalScore}`; // 更新总分显示
                if (currentLevel < levelPositions.length) {
                    currentLevel++; // 增加关卡级别
                    renderLevel(); // 移动图标到新的关卡位置
                    saveLevelData();
                    setTimeout(() => {
                        nextLevelBtn.disabled = false; // 2秒后重新启用按钮
                    }, 2000);
                } else {
                    // 处理最后一关的情况
                    currentLevel = levelPositions.length; // 保持在最后一关
                    saveLevelData();
                }
            }
        });
    });

    resetBtn.addEventListener('click', () => { // 添加重置按钮的点击事件
        if (confirm('确定要重置游戏吗？')) { // 弹出确认对话框
            currentLevel = 1; // 重置当前关卡为1
            renderLevel(); // 重新渲染关卡
            localStorage.removeItem('currentLevel_2'); // 清除历史数据
            localStorage.removeItem('totalScore_2'); // 清除总分数据
            localStorage.removeItem('levelTimes_2'); // 清除关卡时间数据
            nextLevelBtn.disabled = false; // 启用“下一关”按钮
            document.getElementById('level-times').innerHTML = ''; // 清空明细记录

            totalScore = 0; // 重置总分
            levelTimes = []; // 重置关卡时间
            scoreDisplay.textContent = `总分：${totalScore}`; // 更新总分显示
        }
    });

    function displayLevelTimes() {
        const levelTimesDisplay = document.getElementById('level-times');
        levelTimesDisplay.innerHTML = ''; // 清空现有内容
        levelTimes.forEach((time, index) => {
            const levelTimeItem = document.createElement('div');
            const currentTime = new Date();
            const formattedTime = currentTime.toISOString().slice(0, 19).replace('T', ' '); // 格式化时间为 YYYY-MM-DD HH:mm:ss
            levelTimeItem.textContent = `第${index + 1}关: [${formattedTime}]，奖励3积分`; // 添加奖励积分信息
            levelTimesDisplay.appendChild(levelTimeItem);
        });
    }

    function saveLevelData() {
        localStorage.setItem('currentLevel_2', currentLevel); // 修改此处key值
        localStorage.setItem('totalScore_2', totalScore); // 修改此处key值
        localStorage.setItem('levelTimes_2', JSON.stringify(levelTimes)); // 修改此处key值
    }

    function loadLevelData() {
        const savedLevel = localStorage.getItem('currentLevel_2'); // 修改此处key值
        if (savedLevel) {
            currentLevel = parseInt(savedLevel, 10);
        }
        const savedScore = localStorage.getItem('totalScore_2'); // 修改此处key值
        if (savedScore) {
            totalScore = parseInt(savedScore, 10);
        }
        const savedTimes = localStorage.getItem('levelTimes_2'); // 修改此处key值
        if (savedTimes) {
            levelTimes = JSON.parse(savedTimes);
            displayLevelTimes(); // 显示关卡完成时间明细
        }
        iconBase64 = localStorage.getItem('iconBase64_2') || 'p.png'; // 修改此处key值
        createMovableIcon(); // 更新图标
    }

    function animateMove(element, start, end, callback) {
        const duration = 800; // 动画持续时间（毫秒），从500增加到600以减慢20%
        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const x = start.left + (end.left - start.left) * progress;
            const y = start.top + (end.top - start.top) * progress;
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                callback();
                createFireworks(x + 359, y + 160);
                showCongratsText(); // 显示特效字体
            }
        }

        requestAnimationFrame(step);
    }

    function createFireworks(x, y) {
        const numParticles = 500; // 修改粒子数量为75，提高密度50%
        const particles = [];
        let sprayCount = 0; // 添加喷洒计数器

        function spray() {
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * fireworksCanvas.width, // 随机生成x坐标
                    y: Math.random() * fireworksCanvas.height, // 随机生成y坐标
                    radius: Math.random() * 2 + 1,
                    angle: Math.random() * Math.PI * 2,
                    speed: Math.random() * 5 + 2,
                    color: `hsl(${Math.random() * 360}, 100%, 50%)`
                });
            }

            function update() {
                fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

                particles.forEach(particle => {
                    particle.x += Math.cos(particle.angle) * particle.speed;
                    particle.y += Math.sin(particle.angle) * particle.speed;
                    particle.speed -= 0.05;

                    fireworksCtx.beginPath();
                    fireworksCtx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                    fireworksCtx.fillStyle = particle.color;
                    fireworksCtx.fill();

                    if (particle.speed <= 0) {
                        particle.radius = 0;
                    }
                });

                if (particles.some(particle => particle.radius > 0)) {
                    requestAnimationFrame(update);
                } else {
                    particles.length = 0; // 清空粒子数组以便下次喷洒
                    sprayCount++;
                    if (sprayCount < 3) { // 如果喷洒次数小于3次，则继续喷洒
                        setTimeout(spray, 100); // 延迟100毫秒后再次喷洒
                    }
                }
            }

            update();
        }

        spray(); // 初始喷洒
    }

    function showCongratsText() {
        const congratsText = document.createElement('div');
        congratsText.textContent = '你太棒了';
        congratsText.style.position = 'fixed';
        congratsText.style.top = '50%';
        congratsText.style.left = '50%';
        congratsText.style.transform = 'translate(-50%, -50%)';
        congratsText.style.fontSize = '48px';
        congratsText.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        congratsText.style.padding = '10px 20px';
        congratsText.style.borderRadius = '10px';
        congratsText.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
        congratsText.style.opacity = '0';
        congratsText.style.transition = 'opacity 1s ease-in-out';
        congratsText.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)'; // 添加文本阴影

        // 添加彩色特效
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];
        let colorIndex = 0;
        function changeColor() {
            congratsText.style.color = colors[colorIndex];
            colorIndex = (colorIndex + 1) % colors.length;
        }
        const colorInterval = setInterval(changeColor, 200);

        document.body.appendChild(congratsText);

        setTimeout(() => {
            congratsText.style.opacity = '1';
        }, 100);

        setTimeout(() => {
            congratsText.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(congratsText);
                clearInterval(colorInterval); // 清除颜色变化定时器
            }, 2000); // 删除: }, 1000);
        }, 3000); // 删除: }, 2000);
    }

    iconInput.addEventListener('change', (e) => {
        iconBase64 = e.target.value;
        createMovableIcon(); // 更新图标
        localStorage.setItem('iconBase64_2', iconBase64); // 修改此处key值
    });

    startGame();
});











































