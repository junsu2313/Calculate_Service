(function () {
  const { clampNumber, setResultCard, constants } = window.LifeCalcUtils;

  function initBmiPage() {
    const height = document.getElementById("bmiHeight");
    const weight = document.getElementById("bmiWeight");
    const result = document.getElementById("bmiResult");

    const render = () => {
      const heightNumber = clampNumber(height.value, 0, constants.MAX_HEIGHT_CM, 0);
      const weightNumber = clampNumber(weight.value, 0, constants.MAX_WEIGHT_KG, 0);
      const heightValue = heightNumber / 100;

      if (!heightValue || !weightNumber) {
        setResultCard(result, {
          label: "현재 BMI",
          value: "입력 필요",
          description: "키와 몸무게를 입력하면 결과가 표시됩니다.",
        });
        return;
      }

      const bmi = weightNumber / (heightValue * heightValue);
      let label = "정상";

      if (bmi < 18.5) label = "저체중";
      if (bmi >= 23) label = "과체중";
      if (bmi >= 25) label = "비만";

      setResultCard(result, {
        label: "현재 BMI",
        value: bmi.toFixed(1),
        description: `일반적인 분류 기준으로 ${label} 범주입니다.`,
        meta: [
          { label: "키", value: `${heightNumber}cm` },
          { label: "몸무게", value: `${weightNumber}kg` },
          { label: "참고 범위", value: "18.5 - 22.9" },
        ],
      });
    };

    height.addEventListener("input", () => {
      height.value = String(clampNumber(height.value, 0, constants.MAX_HEIGHT_CM, 0));
      render();
    });

    weight.addEventListener("input", () => {
      weight.value = String(clampNumber(weight.value, 0, constants.MAX_WEIGHT_KG, 0));
      render();
    });

    height.value = String(clampNumber(height.value, 0, constants.MAX_HEIGHT_CM, 0));
    weight.value = String(clampNumber(weight.value, 0, constants.MAX_WEIGHT_KG, 0));
    render();
  }

  window.LifeCalcPages = window.LifeCalcPages || {};
  window.LifeCalcPages.bmi = initBmiPage;
})();
