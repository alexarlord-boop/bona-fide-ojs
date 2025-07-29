<template>
    <div class="component">
        <Button class="details-btn">↻ Reload</Button>
        <Button class="details-btn">Get PDF report</Button>
        <Button class="details-btn">Get relation graph</Button>
    </div>
</template>


<style>
.component {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.details-btn {
    max-width: 150px;
    /* margin-right: 10px; */
    padding: 0 15px;
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