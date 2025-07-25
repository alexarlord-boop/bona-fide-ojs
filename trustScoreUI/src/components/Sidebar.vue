<template>
    <div>
        <Button class="details-btn">↻ Reload</Button>
        <Button class="details-btn">Get PDF report</Button>
        <Button class="details-btn">Get relation graph</Button>
    </div>
</template>


<style>

.details-btn {
    max-width: 125px;
    margin-right: 10px;
    padding: 5px;
    color:  #1976d2;
    font-size: 0.8rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    float: right; /* Align to the right */
    margin-left: auto; /* Ensure proper alignment */
  }

  .details-btn:hover {
    background: #e3f2fd;
    color: #0d47a1;
  }
  </style>