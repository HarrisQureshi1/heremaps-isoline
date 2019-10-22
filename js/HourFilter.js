/*  Inside the constructor, we'll be initializing some values (the html elements) and adding event listeners for when the slider       is changed. We'll also create 24 different bar items for our bar chart.
    Whenever the bar chart's data needs to be updated, we'll call the setData() function. This function takes the input data and calculates a height of each individual bar using a CSS percentage value.
    We'll also include some additional functions like: updateLabel, highlightBar, hideData */

import { $, toAMPMFormat } from './helpers.js';

class HourFilter {
   constructor() {
      this.graph = $('.graph');
      this.slider = $('#hour-slider');
      this.sliderLabel = $('#hour-slider-val');
      this.noGraphLabel = $('.no-graph-text');

      this.slider.oninput = () => {
         this.highlightBar(this.slider.value);
         this.updateLabel(this.slider.value);
      }
      this.bars = [];
      for (let i = 0; i < 24; i++) {
         const barContainer = document.createElement('div');
         barContainer.classList.add('bar-container');
         const bar = document.createElement('div');
         bar.classList.add('bar');
         bar.style.height = '0%';
         barContainer.appendChild(bar);
         this.graph.appendChild(barContainer);
         this.bars.push(bar);
      }
   }

   setData(data) {
      this.noGraphLabel.style.opacity = 0;
      this.slider.style.opacity = 1;
      this.sliderLabel.style.opacity = 1;

      const max = Math.max.apply(null, data);
      this.bars.forEach((bar, i) => {
         const percentHeight = data[i] / max * 100 + '%';
         bar.style.height = percentHeight;
      })

      this.highlightBar(this.slider.value);
      this.updateLabel(this.slider.value);
   }

   /* updateLabel() in order to update the HTML label. */
   updateLabel(value) {
      this.sliderLabel.innerText = toAMPMFormat(value);
   }

   /* highlightBar() in order to highlight the selected hour bar when the slider is changed. */
   highlightBar(value) {
      this.bars.forEach(b => b.style.background = '');
      this.bars[value].style.background = 'var(--accent)';
   }

   /* hideData() to temporarily hide the bar chart when the transportation mode does not equal car and range type does not equal time. This is because the traffic parameter of the isoline api only works on transportation mode car and range type time. */
   hideData() {
      this.bars.forEach(bar => bar.style.height = '0px');
      this.noGraphLabel.style.opacity = 1;
      this.slider.style.opacity = 0;
      this.sliderLabel.style.opacity = 0;
      this.noGraphLabel.style.cursor = 'not-allowed';
   }
}

export default HourFilter;
